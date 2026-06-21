"""
LangGraph agent state definition.
Defines the typed state that flows through the processing pipeline.
"""

from typing import TypedDict, Optional, Annotated
from operator import add


class MediaPayload(TypedDict, total=False):
    """Media attachment details for the dispatcher to send."""
    type: str          # "image" or "document"
    url: str           # Public URL of the media
    filename: str      # Filename (for documents)
    caption: str       # Caption to accompany the media
    mime_type: str     # MIME type


class AgentState(TypedDict, total=False):
    """
    State object that flows through all LangGraph nodes.

    Each node reads from and writes to this shared state,
    enabling stateful processing of a single inbound WhatsApp message.
    """

    # --- Input (set by webhook handler before graph invocation) ---
    customer_phone: str           # Customer's WhatsApp phone number
    tenant_id: str                # Which tenant this message belongs to
    message_text: str             # The text of the inbound message
    whatsapp_message_id: str      # WhatsApp's message ID (for read receipts)

    # --- Set by Acknowledge Node ---
    conversation_id: str          # ID of the conversation record in DB

    # --- Set by Context Retriever Node ---
    tenant_name: str              # Tenant's display name
    system_prompt: str            # Tenant's LLM system instructions
    media_library: list[dict]     # Tenant's available media assets
    chat_history: list[dict]      # Last N messages for context

    # --- Set by LLM Reasoning Node ---
    response_text: str            # The text reply from the LLM
    media_to_send: Optional[MediaPayload]  # Media attachment (if LLM decided to send one)
    needs_human: bool             # Whether conversation should be escalated

    # --- Set by Dispatcher Node ---
    dispatch_success: bool        # Whether the reply was sent successfully
