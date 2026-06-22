"""
Conversation model — represents a chat session between a customer and a tenant's bot.
Tracks session status and context variables.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class ConversationStatus(str, Enum):
    """Possible states for a customer conversation."""
    WAITING_FOR_BOT = "WAITING_FOR_BOT"
    AGENT_RESPONDING = "AGENT_RESPONDING"
    RESOLVED = "RESOLVED"
    NEEDS_HUMAN = "NEEDS_HUMAN"


class Conversation(BaseModel):
    """A chat session between a customer phone number and a tenant's agent."""

    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="ID of the tenant this conversation belongs to")
    customer_phone: str = Field(..., description="Customer's WhatsApp phone number")
    status: ConversationStatus = Field(
        default=ConversationStatus.WAITING_FOR_BOT,
        description="Current session status"
    )
    context_variables: dict = Field(
        default_factory=dict,
        description="Custom context variables for the session"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> dict:
        """Convert to MongoDB document."""
        data = self.model_dump()
        data["status"] = self.status.value
        return data

    @classmethod
    def from_doc(cls, doc: dict) -> "Conversation":
        """Create from MongoDB document."""
        doc.pop("_id", None)
        return cls(**doc)
