"""
LangGraph graph builder.
Assembles the four processing nodes into a stateful directed graph
that processes inbound WhatsApp messages end-to-end.

Pipeline flow:
  acknowledge → context_retriever → llm_reasoning → dispatcher
"""

import logging
from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.nodes import (
    acknowledge_node,
    context_retriever_node,
    llm_reasoning_node,
    dispatcher_node,
)

logger = logging.getLogger(__name__)


def build_agent_graph() -> StateGraph:
    """
    Build and compile the LangGraph agent pipeline.

    Returns a compiled graph that can be invoked with an initial AgentState
    containing: customer_phone, tenant_id, message_text, whatsapp_message_id.
    """

    # Create the state graph with our typed state
    graph = StateGraph(AgentState)

    # Add the four processing nodes
    graph.add_node("acknowledge", acknowledge_node)
    graph.add_node("context_retriever", context_retriever_node)
    graph.add_node("llm_reasoning", llm_reasoning_node)
    graph.add_node("dispatcher", dispatcher_node)

    # Define the linear flow: acknowledge → context → llm → dispatcher → END
    graph.set_entry_point("acknowledge")
    graph.add_edge("acknowledge", "context_retriever")
    graph.add_edge("context_retriever", "llm_reasoning")
    graph.add_edge("llm_reasoning", "dispatcher")
    graph.add_edge("dispatcher", END)

    # Compile the graph
    compiled = graph.compile()

    logger.info("LangGraph agent pipeline compiled successfully")
    logger.info("Flow: acknowledge → context_retriever → llm_reasoning → dispatcher → END")

    return compiled


# Compile once at module level for reuse across requests
agent_graph = build_agent_graph()
