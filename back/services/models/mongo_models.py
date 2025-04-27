from pydantic import BaseModel

class ChatMessage(BaseModel):
    chat: str
    text: str
    tag: str
    sender: str
    
