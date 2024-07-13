from typing import Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    messages: list
    model: str = "gpt-3.5-turbo"
    stream: bool = False
