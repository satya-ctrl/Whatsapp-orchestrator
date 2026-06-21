"""
WhatsApp Cloud API client.
Handles all communication with Meta's WhatsApp Business API:
- Read receipts
- Typing indicators
- Text, image, and document message sending
- Template messages for broadcasts
"""

import logging
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)


class WhatsAppClient:
    """Async client for the WhatsApp Business Cloud API."""

    def __init__(self):
        settings = get_settings()
        self.api_base = settings.WHATSAPP_API_BASE
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json",
        }

    @property
    def messages_url(self) -> str:
        """Endpoint URL for sending messages."""
        return f"{self.api_base}/{self.phone_number_id}/messages"

    async def _post(self, payload: dict) -> dict:
        """Send a POST request to the WhatsApp messages endpoint."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                self.messages_url,
                json=payload,
                headers=self.headers,
            )
            if response.status_code != 200:
                logger.error(
                    f"WhatsApp API error {response.status_code}: {response.text}"
                )
            response.raise_for_status()
            return response.json()

    async def mark_as_read(self, message_id: str) -> dict:
        """Mark an inbound message as read (blue double-check marks)."""
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id,
        }
        logger.info(f"Marking message {message_id} as read")
        return await self._post(payload)

    async def send_typing_indicator(self, to_phone: str) -> dict:
        """
        Show the native WhatsApp typing indicator ('typing...') to the customer.
        This keeps users engaged while the LLM processes their message.
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "text",
            "text": {
                "body": "..."
            }
        }
        # In API v20, 'typing_indicator' isn't supported like this natively 
        # so for now we'll just not send typing indicators or comment it out
        logger.info(f"Skipping typing indicator to {to_phone} (Not natively supported in v20)")
        return {}

    async def send_text_message(self, to_phone: str, text: str) -> dict:
        """
        Send a plain text message. Supports WhatsApp markdown:
        *bold*, _italic_, ~strikethrough~, ```monospace```
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": text,
            }
        }
        logger.info(f"Sending text message to {to_phone}: {text[:50]}...")
        result = await self._post(payload)
        return result

    async def send_image_message(
        self, to_phone: str, image_url: str, caption: str = ""
    ) -> dict:
        """Send an image message with an optional caption."""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "image",
            "image": {
                "link": image_url,
            }
        }
        if caption:
            payload["image"]["caption"] = caption
        logger.info(f"Sending image to {to_phone}: {image_url}")
        return await self._post(payload)

    async def send_document_message(
        self, to_phone: str, document_url: str, filename: str, caption: str = ""
    ) -> dict:
        """Send a document (PDF, etc.) message with a filename and optional caption."""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "document",
            "document": {
                "link": document_url,
                "filename": filename,
            }
        }
        if caption:
            payload["document"]["caption"] = caption
        logger.info(f"Sending document to {to_phone}: {filename}")
        return await self._post(payload)

    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        language_code: str = "en_US",
        components: list | None = None,
    ) -> dict:
        """
        Send a pre-approved template message (used for broadcasts).
        Templates must be pre-approved in the Meta Business dashboard.
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
            }
        }
        if components:
            payload["template"]["components"] = components
        logger.info(f"Sending template '{template_name}' to {to_phone}")
        return await self._post(payload)


# Singleton instance
whatsapp_client = WhatsAppClient()
