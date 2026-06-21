"""
Broadcast campaign API routes.
Allows administrators to send pre-approved template messages
to a cohort of phone numbers for a given tenant.
"""

import asyncio
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.services.whatsapp import whatsapp_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tenants", tags=["Broadcast"])


class BroadcastRequest(BaseModel):
    """Request body for triggering a broadcast campaign."""
    template_name: str
    phone_numbers: list[str]
    language_code: str = "en_US"
    components: list[dict] | None = None


class BroadcastResult(BaseModel):
    """Result of a broadcast campaign."""
    total: int
    sent: int
    failed: int
    errors: list[dict]


@router.post("/{tenant_id}/broadcast", response_model=BroadcastResult)
async def send_broadcast(tenant_id: str, body: BroadcastRequest):
    """
    Send a template message broadcast to a list of phone numbers.

    This is used by the Broadcast Campaign Drawer in the frontend.
    Template messages must be pre-approved in the Meta Business dashboard.

    Example templates:
    - "hello_world" (Meta's default test template)
    - "new_catalog_promo" (custom template for catalog promotions)
    """
    db = get_db()

    # Verify tenant exists
    tenant = await db.tenants.find_one({"tenant_id": tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    results = {
        "total": len(body.phone_numbers),
        "sent": 0,
        "failed": 0,
        "errors": [],
    }

    # Send template messages concurrently (but with rate limiting)
    semaphore = asyncio.Semaphore(10)  # Max 10 concurrent sends

    async def send_one(phone: str):
        async with semaphore:
            try:
                await whatsapp_client.send_template_message(
                    to_phone=phone,
                    template_name=body.template_name,
                    language_code=body.language_code,
                    components=body.components,
                )
                results["sent"] += 1
                logger.info(f"Broadcast sent to {phone}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "phone": phone,
                    "error": str(e),
                })
                logger.error(f"Broadcast failed for {phone}: {e}")

    # Fire off all sends
    tasks = [send_one(phone) for phone in body.phone_numbers]
    await asyncio.gather(*tasks)

    logger.info(
        f"Broadcast complete for tenant {tenant_id}: "
        f"{results['sent']}/{results['total']} sent"
    )

    return results
