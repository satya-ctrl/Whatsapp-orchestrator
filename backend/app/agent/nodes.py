"""
LangGraph node implementations.
Four nodes in the processing pipeline:
  1. Acknowledge Node — mark read, send typing indicator, save message to DB
  2. Context Retriever Node — fetch tenant config and chat history
  3. LLM Reasoning Node — call Gemini with tools for agentic decision-making
  4. Dispatcher Node — send WhatsApp reply and record outbound message
"""

import logging
from datetime import datetime
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.agent.state import AgentState
from app.agent.tools import AGENT_TOOLS
from app.database import get_db
from app.services.whatsapp import whatsapp_client
from app.services.llm import get_llm
from app.models.conversation import ConversationStatus

logger = logging.getLogger(__name__)

# Number of recent messages to include as chat context
HISTORY_WINDOW = 5


# ---------------------------------------------------------------------------
# Node 1: Acknowledge
# ---------------------------------------------------------------------------

async def acknowledge_node(state: AgentState) -> dict:
    """
    First node in the pipeline. Fires immediately upon receiving a message.

    Actions:
    - Sends a read receipt (blue double-check) to the customer
    - Starts the typing indicator ('typing...' bubble)
    - Saves the inbound message to the database
    - Creates or updates the conversation record
    """
    db = get_db()
    customer_phone = state["customer_phone"]
    tenant_id = state["tenant_id"]
    message_text = state["message_text"]
    wa_message_id = state["whatsapp_message_id"]

    logger.info(f"[Acknowledge] Processing message from {customer_phone} for tenant {tenant_id}")

    # Send read receipt and typing indicator concurrently
    try:
        await whatsapp_client.mark_as_read(wa_message_id)
    except Exception as e:
        logger.warning(f"Failed to mark as read: {e}")

    try:
        await whatsapp_client.send_typing_indicator(customer_phone)
    except Exception as e:
        logger.warning(f"Failed to send typing indicator: {e}")

    # Find or create conversation
    conversation = await db.conversations.find_one({
        "tenant_id": tenant_id,
        "customer_phone": customer_phone,
    })

    if conversation:
        conversation_id = conversation["conversation_id"]
        # Update status to AGENT_RESPONDING
        await db.conversations.update_one(
            {"conversation_id": conversation_id},
            {"$set": {
                "status": ConversationStatus.AGENT_RESPONDING.value,
                "updated_at": datetime.utcnow(),
            }}
        )
    else:
        # Create new conversation
        import uuid
        conversation_id = str(uuid.uuid4())
        await db.conversations.insert_one({
            "conversation_id": conversation_id,
            "tenant_id": tenant_id,
            "customer_phone": customer_phone,
            "status": ConversationStatus.AGENT_RESPONDING.value,
            "context_variables": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })

    # Save inbound message to audit log
    import uuid as uuid_mod
    await db.messages.insert_one({
        "message_id": str(uuid_mod.uuid4()),
        "conversation_id": conversation_id,
        "tenant_id": tenant_id,
        "direction": "inbound",
        "sender": customer_phone,
        "text": message_text,
        "media": None,
        "message_type": "text",
        "whatsapp_message_id": wa_message_id,
        "timestamp": datetime.utcnow(),
    })

    logger.info(f"[Acknowledge] Message saved. Conversation: {conversation_id}")

    return {"conversation_id": conversation_id}


# ---------------------------------------------------------------------------
# Node 2: Context Retriever
# ---------------------------------------------------------------------------

async def context_retriever_node(state: AgentState) -> dict:
    """
    Pulls tenant configuration and recent chat history from the database.

    Actions:
    - Fetches the tenant's system prompt and media library
    - Retrieves the last N messages for conversational context
    """
    db = get_db()
    tenant_id = state["tenant_id"]
    conversation_id = state["conversation_id"]

    logger.info(f"[Context] Retrieving context for tenant {tenant_id}")

    # Get tenant config
    tenant = await db.tenants.find_one({"tenant_id": tenant_id})
    if not tenant:
        logger.error(f"Tenant {tenant_id} not found!")
        return {
            "system_prompt": "You are a helpful assistant.",
            "media_library": [],
            "chat_history": [],
            "tenant_name": "Unknown",
        }

    # Get last N messages for context
    cursor = db.messages.find(
        {"conversation_id": conversation_id}
    ).sort("timestamp", -1).limit(HISTORY_WINDOW)

    messages_docs = await cursor.to_list(length=HISTORY_WINDOW)
    messages_docs.reverse()  # Chronological order

    chat_history = []
    for msg in messages_docs:
        chat_history.append({
            "role": "user" if msg["direction"] == "inbound" else "assistant",
            "content": msg.get("text", "[media]") or "[media]",
        })

    logger.info(
        f"[Context] Retrieved {len(chat_history)} history messages, "
        f"{len(tenant.get('media_library', []))} media assets"
    )

    return {
        "tenant_name": tenant["name"],
        "system_prompt": tenant["system_prompt"],
        "media_library": tenant.get("media_library", []),
        "chat_history": chat_history,
    }


# ---------------------------------------------------------------------------
# Node 3: LLM Reasoning
# ---------------------------------------------------------------------------

async def llm_reasoning_node(state: AgentState) -> dict:
    """
    Calls Gemini to generate a response with agentic tool use.

    The LLM receives:
    - The tenant's system prompt (brand-specific instructions)
    - Recent chat history for context
    - Available tools (send_media_asset) for attaching media

    The LLM autonomously decides whether to:
    - Reply with plain text, OR
    - Call the send_media_asset tool to attach a document/image
    """
    logger.info("[LLM] Invoking Gemini for reasoning...")

    system_prompt = state.get("system_prompt", "You are a helpful assistant.")
    chat_history = state.get("chat_history", [])
    message_text = state.get("message_text", "")
    media_library = state.get("media_library", [])

    # Build available media info for the system prompt
    media_info = ""
    if media_library:
        media_items = []
        for asset in media_library:
            media_items.append(
                f"- Keyword: '{asset['keyword']}' → {asset.get('description', asset['type'])} "
                f"({asset['type']})"
            )
        media_info = (
            "\n\nAVAILABLE MEDIA ASSETS (use send_media_asset tool with the keyword):\n"
            + "\n".join(media_items)
        )

    full_system_prompt = system_prompt + media_info

    # Build message list for the LLM
    messages = [SystemMessage(content=full_system_prompt)]

    # Add chat history (excluding the current message which is last in history)
    for msg in chat_history[:-1]:  # Skip current message (already in history)
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    # Add current message
    messages.append(HumanMessage(content=message_text))

    # Get LLM with tools bound
    llm = get_llm()
    llm_with_tools = llm.bind_tools(AGENT_TOOLS)

    # Invoke the LLM
    try:
        response = await llm_with_tools.ainvoke(messages)
    except Exception as e:
        logger.error(f"[LLM] Error invoking Gemini: {e}")
        return {
            "response_text": "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
            "media_to_send": None,
            "needs_human": False,
        }

    # Parse the response
    response_text = response.content if isinstance(response.content, str) else ""
    media_to_send = None
    needs_human = False

    # Check if the LLM made a tool call
    if response.tool_calls:
        for tool_call in response.tool_calls:
            if tool_call["name"] == "send_media_asset":
                keyword = tool_call["args"].get("keyword", "").lower()
                logger.info(f"[LLM] Tool call: send_media_asset(keyword='{keyword}')")

                # Look up the keyword in the tenant's media library
                matched_asset = None
                for asset in media_library:
                    if asset["keyword"].lower() in keyword or keyword in asset["keyword"].lower():
                        matched_asset = asset
                        break

                if matched_asset:
                    media_to_send = {
                        "type": matched_asset["type"],
                        "url": matched_asset["url"],
                        "filename": matched_asset.get("filename", "attachment"),
                        "caption": matched_asset.get("description", ""),
                        "mime_type": matched_asset.get("mime_type", "application/octet-stream"),
                    }
                    logger.info(f"[LLM] Matched media asset: {matched_asset['keyword']}")

                    # If the LLM didn't provide text alongside the tool call,
                    # generate a brief accompanying message
                    if not response_text:
                        response_text = f"Here's the {matched_asset['keyword']} you requested!"
                else:
                    logger.warning(f"[LLM] No media asset matched keyword: {keyword}")
                    if not response_text:
                        response_text = f"I'm sorry, I couldn't find a '{keyword}' asset in our library. How else can I help you?"

    # Sentiment-based escalation (bonus feature)
    # Check for frustration indicators in the response
    frustration_keywords = [
        "speak to a human", "real person", "manager", "complaint",
        "frustrated", "unacceptable", "terrible", "worst"
    ]
    user_text_lower = message_text.lower()
    if any(kw in user_text_lower for kw in frustration_keywords):
        needs_human = True
        response_text = (
            "I understand your frustration, and I want to make sure you get the best help possible. "
            "I'm connecting you with a human representative who can assist you further. "
            "Please hold on — someone will be with you shortly."
        )
        logger.info("[LLM] Frustration detected — escalating to human agent")

    logger.info(f"[LLM] Response generated. Media: {media_to_send is not None}, Escalate: {needs_human}")

    return {
        "response_text": response_text,
        "media_to_send": media_to_send,
        "needs_human": needs_human,
    }


# ---------------------------------------------------------------------------
# Node 4: Dispatcher
# ---------------------------------------------------------------------------

async def dispatcher_node(state: AgentState) -> dict:
    """
    Final node — sends the actual WhatsApp reply and records it in the database.

    Actions:
    - Sends text message (always)
    - Sends media attachment if the LLM decided to include one
    - Records the outbound message(s) in the audit log
    - Updates conversation status
    """
    db = get_db()
    customer_phone = state["customer_phone"]
    tenant_id = state["tenant_id"]
    conversation_id = state["conversation_id"]
    response_text = state.get("response_text", "")
    media_to_send = state.get("media_to_send")
    needs_human = state.get("needs_human", False)

    logger.info(f"[Dispatcher] Sending reply to {customer_phone}")

    import uuid

    dispatch_success = True

    try:
        # Send text message first
        if response_text:
            result = await whatsapp_client.send_text_message(customer_phone, response_text)
            wa_msg_id = result.get("messages", [{}])[0].get("id", "")

            # Record outbound text message
            await db.messages.insert_one({
                "message_id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "tenant_id": tenant_id,
                "direction": "outbound",
                "sender": "bot",
                "text": response_text,
                "media": None,
                "message_type": "text",
                "whatsapp_message_id": wa_msg_id,
                "timestamp": datetime.utcnow(),
            })

        # Send media attachment if the LLM decided to include one
        if media_to_send:
            media_type = media_to_send["type"]
            if media_type == "image":
                result = await whatsapp_client.send_image_message(
                    customer_phone,
                    media_to_send["url"],
                    caption=media_to_send.get("caption", ""),
                )
            elif media_type == "document":
                result = await whatsapp_client.send_document_message(
                    customer_phone,
                    media_to_send["url"],
                    filename=media_to_send.get("filename", "document.pdf"),
                    caption=media_to_send.get("caption", ""),
                )
            else:
                logger.warning(f"[Dispatcher] Unknown media type: {media_type}")
                result = {}

            wa_msg_id = result.get("messages", [{}])[0].get("id", "")

            # Record outbound media message
            await db.messages.insert_one({
                "message_id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "tenant_id": tenant_id,
                "direction": "outbound",
                "sender": "bot",
                "text": media_to_send.get("caption", ""),
                "media": {
                    "url": media_to_send["url"],
                    "mime_type": media_to_send.get("mime_type", "application/octet-stream"),
                    "filename": media_to_send.get("filename"),
                },
                "message_type": media_type,
                "whatsapp_message_id": wa_msg_id,
                "timestamp": datetime.utcnow(),
            })

    except Exception as e:
        logger.error(f"[Dispatcher] Failed to send reply: {e}")
        dispatch_success = False

    # Update conversation status
    new_status = (
        ConversationStatus.NEEDS_HUMAN.value if needs_human
        else ConversationStatus.WAITING_FOR_BOT.value
    )
    await db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.utcnow(),
        }}
    )

    logger.info(f"[Dispatcher] Reply sent. Status: {new_status}, Success: {dispatch_success}")

    return {"dispatch_success": dispatch_success}
