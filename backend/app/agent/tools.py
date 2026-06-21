"""
LLM tools for agentic decision-making.
These tools are bound to the Gemini LLM so it can decide when to
attach media assets (images, documents) from the tenant's library.
"""

from langchain_core.tools import tool


@tool
def send_media_asset(keyword: str) -> dict:
    """
    Look up and send a media asset (image or document) from the tenant's media library.

    Use this tool when the customer asks for visual content like catalogs,
    product images, repair diagrams, invoices, or any media asset.

    Args:
        keyword: The search keyword to match against the media library.
                 Examples: 'catalog', 'sofa', 'invoice', 'engine', 'showroom'

    Returns:
        A dict with the matched asset details, or an error if not found.
    """
    # This tool's actual logic is handled in the LLM reasoning node.
    # The tool definition here exists so the LLM knows it can call it.
    # The node intercepts the tool call and resolves it against the tenant's
    # media library stored in the agent state.
    return {"keyword": keyword, "status": "lookup_requested"}


# List of all tools available to the LLM
AGENT_TOOLS = [send_media_asset]
