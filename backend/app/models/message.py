"""
Message model — audit log for all inbound and outbound WhatsApp messages.
Stores text content, media attachments, and metadata.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class MessageDirection(str, Enum):
    """Direction of the message."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class MessageType(str, Enum):
    """Type of WhatsApp message."""
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"


class MediaAttachment(BaseModel):
    """Media attachment metadata for image/document messages."""
    url: str = Field(..., description="Public URL of the media")
    mime_type: str = Field(default="application/octet-stream")
    filename: Optional[str] = Field(default=None, description="Filename for documents")


class Message(BaseModel):
    """A single message in the audit log — either inbound from customer or outbound from bot."""

    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str = Field(..., description="Parent conversation ID")
    tenant_id: str = Field(..., description="Tenant this message belongs to")
    direction: MessageDirection = Field(..., description="inbound or outbound")
    sender: str = Field(..., description="Phone number of the sender")
    text: Optional[str] = Field(default=None, description="Text content of the message")
    media: Optional[MediaAttachment] = Field(
        default=None,
        description="Media attachment if message contains image/document"
    )
    message_type: MessageType = Field(
        default=MessageType.TEXT,
        description="Type of message: text, image, or document"
    )
    whatsapp_message_id: Optional[str] = Field(
        default=None,
        description="WhatsApp's message ID for tracking"
    )
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> dict:
        """Convert to MongoDB document."""
        data = self.model_dump()
        data["direction"] = self.direction.value
        data["message_type"] = self.message_type.value
        return data

    @classmethod
    def from_doc(cls, doc: dict) -> "Message":
        """Create from MongoDB document."""
        doc.pop("_id", None)
        return cls(**doc)
