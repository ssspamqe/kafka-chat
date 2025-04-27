from pydantic import BaseModel
from datetime import datetime

class ChatMessage(BaseModel):
    chat: str
    text: str
    timestamp: datetime
    tag: str
    sender: str