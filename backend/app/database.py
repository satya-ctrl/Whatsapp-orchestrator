"""
MongoDB database connection and seed data.
Uses Motor (async MongoDB driver) for non-blocking database operations.
Pre-seeds two demo tenants: Luxury Furniture Store and Automotive Care.
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

logger = logging.getLogger(__name__)

# Global database references
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Initialize MongoDB connection and seed data if needed."""
    global _client, _db
    settings = get_settings()

    logger.info("Connecting to MongoDB...")
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.DATABASE_NAME]

    # Create indexes for efficient queries
    await _db.tenants.create_index("tenant_id", unique=True)
    await _db.conversations.create_index("conversation_id", unique=True)
    await _db.conversations.create_index([("tenant_id", 1), ("customer_phone", 1)])
    await _db.messages.create_index("conversation_id")
    await _db.messages.create_index([("tenant_id", 1), ("timestamp", -1)])

    # Seed demo tenants if empty
    tenant_count = await _db.tenants.count_documents({})
    if tenant_count == 0:
        await seed_tenants()

    logger.info("MongoDB connected and indexes created.")


async def disconnect_db() -> None:
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_db() -> AsyncIOMotorDatabase:
    """Get the database instance. Must be called after connect_db()."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _db


# ---------------------------------------------------------------------------
# Seed Data — Two demo tenants with media libraries
# ---------------------------------------------------------------------------

SEED_TENANTS = [
    {
        "tenant_id": "tenant-a-luxury-furniture",
        "name": "Luxe Living Furniture",
        "system_prompt": (
            "You are a premium customer support and sales assistant for Luxe Living Furniture, "
            "a luxury furniture brand. You help customers browse our exclusive collection, "
            "answer questions about materials, dimensions, pricing, and delivery. "
            "Be warm, professional, and knowledgeable. Use elegant language befitting a luxury brand.\n\n"
            "IMPORTANT RULES:\n"
            "- If a customer asks for a 'catalog', 'brochure', or 'product list', use the send_media_asset "
            "tool with keyword 'catalog' to send them our PDF catalog.\n"
            "- If a customer asks to see a specific product like 'sofa', 'table', 'chair', or 'showroom', "
            "use the send_media_asset tool with the matching keyword to send them an image.\n"
            "- Always be helpful and suggest related products.\n"
            "- For pricing inquiries, provide ranges and offer to connect with a sales specialist.\n"
            "- Keep responses concise but informative."
        ),
        "whatsapp_phone_number_id": "",
        "media_library": [
            {
                "keyword": "catalog",
                "url": "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
                "type": "document",
                "mime_type": "application/pdf",
                "filename": "LuxeLiving_Catalog_2025.pdf",
                "description": "Complete product catalog with pricing"
            },
            {
                "keyword": "sofa",
                "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Premium leather sofa from our Milano collection"
            },
            {
                "keyword": "table",
                "url": "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Handcrafted oak dining table"
            },
            {
                "keyword": "chair",
                "url": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Ergonomic designer chair"
            },
            {
                "keyword": "showroom",
                "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Our flagship showroom interior"
            },
        ],
    },
    {
        "tenant_id": "tenant-b-automotive-care",
        "name": "AutoPro Service Center",
        "system_prompt": (
            "You are a helpful customer service assistant for AutoPro Service Center, "
            "an automotive care and repair company. You help customers schedule service appointments, "
            "check service status, understand repair procedures, and answer questions about car maintenance.\n\n"
            "IMPORTANT RULES:\n"
            "- If a customer asks for an 'invoice', 'receipt', or 'bill', use the send_media_asset "
            "tool with keyword 'invoice' to send them a sample invoice PDF.\n"
            "- If a customer asks about 'repair diagrams', 'engine', 'brake', or 'technical', "
            "use the send_media_asset tool with the matching keyword to send them an image.\n"
            "- For appointment scheduling, collect: vehicle make/model, preferred date/time, service type.\n"
            "- Be professional, clear, and technically accurate.\n"
            "- Keep responses concise."
        ),
        "whatsapp_phone_number_id": "",
        "media_library": [
            {
                "keyword": "invoice",
                "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
                "type": "document",
                "mime_type": "application/pdf",
                "filename": "AutoPro_Invoice_Sample.pdf",
                "description": "Sample service invoice"
            },
            {
                "keyword": "repair",
                "url": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Repair diagram showing engine components"
            },
            {
                "keyword": "engine",
                "url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Engine diagnostic overview"
            },
            {
                "keyword": "brake",
                "url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Brake system diagram"
            },
            {
                "keyword": "service",
                "url": "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800",
                "type": "image",
                "mime_type": "image/jpeg",
                "filename": None,
                "description": "Our service center facility"
            },
        ],
    },
]


async def seed_tenants() -> None:
    """Insert demo tenants into the database if they don't exist."""
    db = get_db()
    for tenant_data in SEED_TENANTS:
        existing = await db.tenants.find_one({"tenant_id": tenant_data["tenant_id"]})
        if not existing:
            await db.tenants.insert_one(tenant_data)
            logger.info(f"Seeded tenant: {tenant_data['name']}")
    logger.info("Tenant seeding complete.")
