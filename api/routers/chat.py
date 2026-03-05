from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.services.ai import chat

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    context: dict | None = None


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply = await chat(
            messages=[m.model_dump() for m in request.messages],
            context=request.context,
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
