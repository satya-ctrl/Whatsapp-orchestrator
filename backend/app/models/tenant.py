"""
Tenant model — represents a company using the WhatsApp Agent SaaS.
Each tenant has unique branding, system prompts, and a media library.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class MediaAsset(BaseModel):
    """A single entry in the tenant's media library.
    Maps a keyword to a downloadable asset (image or document)."""

    keyword: str = Field(..., description="Search keyword e.g. 'catalog', 'sofa'")
    url: str = Field(..., description="Public URL to the media file")
    type: str = Field(..., description="Asset type: 'image' or 'document'")
    mime_type: str = Field(default="application/pdf", description="MIME type of the asset")
    filename: Optional[str] = Field(default=None, description="Filename for document attachments")
    description: Optional[str] = Field(default=None, description="Brief description of the asset")


class Tenant(BaseModel):
    """A business (tenant) that uses the WhatsApp Agent platform."""

    tenant_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., description="Business name")
    system_prompt: str = Field(..., description="LLM system instructions for this tenant")
    whatsapp_phone_number_id: str = Field(
        default="",
        description="WhatsApp Business phone number ID for this tenant"
    )
    media_library: list[MediaAsset] = Field(
        default_factory=list,
        description="Pre-seeded media assets available for the agent to send"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_doc(self) -> dict:
        """Convert to MongoDB document."""
        return self.model_dump()

    @classmethod
    def from_doc(cls, doc: dict) -> "Tenant":
        """Create from MongoDB document."""
        doc.pop("_id", None)
        return cls(**doc)
