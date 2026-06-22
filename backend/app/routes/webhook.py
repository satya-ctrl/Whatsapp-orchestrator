"""
WhatsApp webhook routes.
Handles Meta's webhook verification (GET) and inbound message processing (POST).

CRITICAL: The POST endpoint returns 200 OK immediately and processes
the LangGraph pipeline in a background task to avoid Meta's 3-second timeout.
"""

import asyncio
import hashlib
import hmac
import logging
from fastapi import APIRouter, Request, Response, Query, HTTPException

from app.config import get_settings
from app.agent.graph import agent_graph
from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


# ---------------------------------------------------------------------------
# GET — Meta Webhook Verification Challenge
# ---------------------------------------------------------------------------

@router.get("/whatsapp")
async def verify_webhook(
    request: Request,
):
    """
    Meta sends a GET request to verify the webhook endpoint.
    We must respond with the hub.challenge value if the verify token matches.
    """
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    settings = get_settings()

    if mode == "subscribe" and token == settings.WEBHOOK_VERIFY_TOKEN:
        logger.info("Webhook verification successful")
        return Response(content=challenge, media_type="text/plain")

    logger.warning(f"Webhook verification failed. Mode: {mode}, Token match: {token == settings.WEBHOOK_VERIFY_TOKEN}")
    raise HTTPException(status_code=403, detail="Verification failed")


# ---------------------------------------------------------------------------
# POST — Inbound Message Handler (Async)
# ---------------------------------------------------------------------------

@router.post("/whatsapp")
async def handle_webhook(request: Request):
    """
    Receives inbound WhatsApp messages from Meta.

    IMMEDIATELY returns 200 OK to avoid Meta's retry mechanism,
    then processes the message in a background asyncio task.
    """
    # Read raw body first (needed for signature validation AND JSON parsing)
    raw_body = await request.body()

    # Optional: Validate webhook signature (bonus feature)
    settings = get_settings()
    if settings.META_APP_SECRET:
        signature = request.headers.get("X-Hub-Signature-256", "")
        if signature:
            expected = "sha256=" + hmac.new(
                settings.META_APP_SECRET.encode(),
                raw_body,
                hashlib.sha256,
            ).hexdigest()
            if not hmac.compare_digest(signature, expected):
                logger.warning("Invalid webhook signature!")
                raise HTTPException(status_code=401, detail="Invalid signature")

    import json
    body = json.loads(raw_body)

    # Parse the webhook payload to extract message details
    message_data = _extract_message_data(body)

    if message_data:
        # Kick off LangGraph processing in the background
        # This is critical — we must return 200 within 3 seconds
        asyncio.create_task(_process_message(message_data))
        logger.info(f"Message from {message_data['customer_phone']} queued for processing")

    # Always return 200 OK immediately
    return Response(status_code=200)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_message_data(body: dict) -> dict | None:
    """
    Parse Meta's webhook payload to extract the relevant message fields.

    The payload structure is deeply nested:
    body.entry[].changes[].value.messages[]
    """
    try:
        entry = body.get("entry", [])
        if not entry:
            return None

        changes = entry[0].get("changes", [])
        if not changes:
            return None

        value = changes[0].get("value", {})

        # Check if this is a message event (not a status update)
        messages = value.get("messages", [])
        if not messages:
            logger.debug("Webhook event is not a message (possibly a status update)")
            return None

        message = messages[0]
        metadata = value.get("metadata", {})
        contacts = value.get("contacts", [])

        # Extract phone number ID from metadata to resolve tenant
        phone_number_id = metadata.get("phone_number_id", "")

        # Get the message text (handle different message types)
        message_text = ""
        if message.get("type") == "text":
            message_text = message.get("text", {}).get("body", "")
        elif message.get("type") == "image":
            message_text = message.get("image", {}).get("caption", "[Image received]")
        elif message.get("type") == "document":
            message_text = message.get("document", {}).get("caption", "[Document received]")
        else:
            message_text = f"[{message.get('type', 'unknown')} message received]"

        return {
            "customer_phone": message.get("from", ""),
            "message_text": message_text,
            "whatsapp_message_id": message.get("id", ""),
            "phone_number_id": phone_number_id,
            "message_type": message.get("type", "text"),
        }

    except (IndexError, KeyError) as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        return None


async def _process_message(message_data: dict) -> None:
    """
    Background task that runs the LangGraph agent pipeline.
    This runs AFTER the webhook has already returned 200 OK to Meta.
    """
    try:
        db = get_db()
        customer_phone = message_data["customer_phone"]
        message_text = message_data.get("message_text", "").strip()

        # Check for manual tenant switch commands (useful for testing with 1 phone number)
        if message_text.lower() == "/tenant a":
            target_tenant = "tenant-a-luxury-furniture"
            await db.conversations.update_many(
                {"customer_phone": customer_phone},
                {"$set": {"tenant_id": target_tenant}}
            )
            logger.info(f"Switched {customer_phone} to {target_tenant}")
        elif message_text.lower() == "/tenant b":
            target_tenant = "tenant-b-automotive-care"
            await db.conversations.update_many(
                {"customer_phone": customer_phone},
                {"$set": {"tenant_id": target_tenant}}
            )
            logger.info(f"Switched {customer_phone} to {target_tenant}")

        # Resolve tenant from the phone_number_id in the webhook payload.
        # First try matching by whatsapp_phone_number_id,
        # then fall back to the first tenant (for development).
        phone_number_id = message_data.get("phone_number_id", "")

        tenant = None
        if phone_number_id:
            tenant = await db.tenants.find_one(
                {"whatsapp_phone_number_id": phone_number_id}
            )

        if not tenant:
            # Fallback: check if there's a conversation already for this phone number
            existing_conv = await db.conversations.find_one(
                {"customer_phone": customer_phone}
            )
            if existing_conv:
                tenant = await db.tenants.find_one(
                    {"tenant_id": existing_conv["tenant_id"]}
                )

        if not tenant:
            # Default to the first tenant (development fallback)
            tenant = await db.tenants.find_one({})

        if not tenant:
            logger.error("No tenants found in database!")
            return

        tenant_id = tenant["tenant_id"]

        # Check if conversation is in NEEDS_HUMAN status (don't auto-reply)
        existing_conv = await db.conversations.find_one({
            "tenant_id": tenant_id,
            "customer_phone": message_data["customer_phone"],
            "status": "NEEDS_HUMAN",
        })
        if existing_conv:
            logger.info(
                f"Conversation {existing_conv['conversation_id']} is in NEEDS_HUMAN status. "
                "Skipping auto-reply."
            )
            return

        # Build the initial state for the LangGraph agent
        initial_state = {
            "customer_phone": message_data["customer_phone"],
            "tenant_id": tenant_id,
            "message_text": message_data["message_text"],
            "whatsapp_message_id": message_data["whatsapp_message_id"],
        }

        logger.info(f"Invoking LangGraph agent for tenant {tenant_id}")

        # Run the LangGraph pipeline
        result = await agent_graph.ainvoke(initial_state)

        logger.info(
            f"LangGraph pipeline completed. Dispatch success: {result.get('dispatch_success')}"
        )

    except Exception as e:
        logger.error(f"Error in background message processing: {e}", exc_info=True)
