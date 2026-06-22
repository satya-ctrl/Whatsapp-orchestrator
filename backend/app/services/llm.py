"""
Gemini LLM service wrapper.
Provides a unified interface for calling Google's Gemini model
with tool/function calling support via LangChain.
"""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings

logger = logging.getLogger(__name__)


def get_llm(temperature: float = 0.3) -> ChatGoogleGenerativeAI:
    """
    Create a Gemini LLM instance configured for the WhatsApp agent.

    Uses gemini-2.0-flash for a good balance of speed and quality,
    running entirely via LangChain's ChatGoogleGenerativeAI.
    """
    settings = get_settings()

    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.4,  # slightly creative but highly grounded
        max_retries=2,
    )

    logger.info("Gemini LLM instance created (gemini-2.0-flash)")
    return llm
