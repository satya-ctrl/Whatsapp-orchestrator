"""
Conversation API routes — used by the frontend dashboard.
Provides conversation listing and message thread views
for the Live Chat Monitor feature.
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Conversations"])


@router.get("/tenants/{tenant_id}/conversations")
async def list_conversations(
    tenant_id: str,
    status: str = Query(default=None, description="Filter by status"),
    limit: int = Query(default=50, le=200),
):
    """
    List all conversations for a given tenant.
    Supports optional status filtering.
    Used by the Live Chat Monitor to show active phone numbers.
    """
    db = get_db()

    query = {"tenant_id": tenant_id}
    if status:
        query["status"] = status

    cursor = db.conversations.find(
        query,
        {"_id": 0}
    ).sort("updated_at", -1).limit(limit)

    conversations = await cursor.to_list(length=limit)

    # Enrich each conversation with the last message preview
    for conv in conversations:
        last_msg = await db.messages.find_one(
            {"conversation_id": conv["conversation_id"]},
            {"_id": 0, "text": 1, "direction": 1, "message_type": 1, "timestamp": 1},
            sort=[("timestamp", -1)],
        )
        conv["last_message"] = last_msg

    return {"conversations": conversations}


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    limit: int = Query(default=100, le=500),
):
    """
    Get the full message thread for a conversation.
    Returns messages in chronological order.
    Used by the Live Chat Monitor to display the stylized chat thread.
    """
    db = get_db()

    # Verify conversation exists
    conversation = await db.conversations.find_one(
        {"conversation_id": conversation_id},
        {"_id": 0}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get messages in chronological order
    cursor = db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1).limit(limit)

    messages = await cursor.to_list(length=limit)

    return {
        "conversation": conversation,
        "messages": messages,
    }


@router.patch("/conversations/{conversation_id}/status")
async def update_conversation_status(conversation_id: str, body: dict):
    """
    Update a conversation's status.
    Used by the dashboard to resolve conversations or escalate to human.
    """
    db = get_db()
    new_status = body.get("status")

    valid_statuses = ["WAITING_FOR_BOT", "AGENT_RESPONDING", "RESOLVED", "NEEDS_HUMAN"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    from datetime import datetime
    result = await db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"status": "updated", "new_status": new_status}
