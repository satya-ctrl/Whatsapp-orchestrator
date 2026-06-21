"""
FastAPI application entry point.
Configures CORS, lifespan events, logging, and includes all route modules.
"""

import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import connect_db, disconnect_db
from app.routes import webhook, tenants, conversations, broadcast

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — connect/disconnect MongoDB
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events."""
    logger.info("🚀 Starting Multi-Tenant WhatsApp Agent...")
    await connect_db()
    logger.info("✅ Database connected and seeded")
    yield
    await disconnect_db()
    logger.info("👋 Application shutdown complete")


# ---------------------------------------------------------------------------
# Create FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Multi-Tenant WhatsApp AI Agent",
    description=(
        "An agentic WhatsApp support & sales bot SaaS platform. "
        "Supports multiple tenants with LangGraph-powered AI orchestration, "
        "rich media responses, and real-time conversation monitoring."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS — allow the frontend dashboard to connect
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Include routers
# ---------------------------------------------------------------------------

app.include_router(webhook.router)
app.include_router(tenants.router)
app.include_router(conversations.router)
app.include_router(broadcast.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def health_check():
    """Root endpoint — confirms the server is running."""
    return {
        "status": "healthy",
        "service": "Multi-Tenant WhatsApp AI Agent",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint for container orchestrators."""
    return {"status": "ok"}

# ---------------------------------------------------------------------------
# Serve Frontend Static Files (for single-container Docker deployment)
# ---------------------------------------------------------------------------
frontend_dist_path = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
if os.path.isdir(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")
else:
    logger.warning("Frontend dist folder not found. Running in API-only mode.")
