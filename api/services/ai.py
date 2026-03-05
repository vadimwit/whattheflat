from api.config import settings


SYSTEM_PROMPT = """You are a friendly, beginner-aware music theory assistant for WhatTheFlat — a live jam helper app.
You help musicians understand what's happening harmonically during a jam session.
Keep answers short, warm, and jargon-free. If you use a music term, briefly explain it.
Never say someone played a "wrong" note — always frame it as "try these instead".
When given context about the current key and chord, use it in your response."""


async def chat(messages: list[dict], context: dict | None = None) -> str:
    system = SYSTEM_PROMPT
    if context:
        parts = []
        if context.get("key"):
            parts.append(f"Current key: {context['key']}")
        if context.get("chord"):
            parts.append(f"Current chord: {context['chord']}")
        if parts:
            system += "\n\nLive session context:\n" + "\n".join(parts)

    if settings.ai_mode == "online":
        return await _chat_claude(messages, system)
    else:
        return await _chat_ollama(messages, system)


async def _chat_claude(messages: list[dict], system: str) -> str:
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    response = await client.messages.create(
        model=settings.claude_model,
        max_tokens=512,
        system=system,
        messages=messages,
    )
    return response.content[0].text


async def _chat_ollama(messages: list[dict], system: str) -> str:
    import ollama

    client = ollama.AsyncClient(host=settings.ollama_host)
    full_messages = [{"role": "system", "content": system}] + messages
    response = await client.chat(
        model=settings.ollama_model,
        messages=full_messages,
    )
    return response.message.content
