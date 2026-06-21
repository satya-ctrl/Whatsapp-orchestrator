"""
Tenant API routes — used by the frontend dashboard.
Provides tenant listing and detail views for the tenant switcher.
"""

import logging
from fastapi import APIRouter, HTTPException
from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tenants", tags=["Tenants"])


@router.get("")
async def list_tenants():
    """
    List all tenants.
    Used by the frontend's Tenant Switcher component.
    """
    db = get_db()
    cursor = db.tenants.find({}, {
        "_id": 0,
        "tenant_id": 1,
        "name": 1,
        "whatsapp_phone_number_id": 1,
        "created_at": 1,
    })
    tenants = await cursor.to_list(length=100)
    return {"tenants": tenants}


@router.get("/{tenant_id}")
async def get_tenant(tenant_id: str):
    """
    Get detailed information about a specific tenant.
    Includes the media library and system prompt.
    """
    db = get_db()
    tenant = await db.tenants.find_one(
        {"tenant_id": tenant_id},
        {"_id": 0}
    )
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}/phone")
async def update_tenant_phone(tenant_id: str, body: dict):
    """
    Update a tenant's WhatsApp phone number ID.
    Useful during setup when linking a tenant to a WhatsApp number.
    """
    db = get_db()
    phone_number_id = body.get("whatsapp_phone_number_id", "")

    result = await db.tenants.update_one(
        {"tenant_id": tenant_id},
        {"$set": {"whatsapp_phone_number_id": phone_number_id}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return {"status": "updated", "whatsapp_phone_number_id": phone_number_id}
