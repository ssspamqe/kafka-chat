from bson import ObjectId  # Import ObjectId to handle MongoDB IDs
from pydantic import BaseModel
from config.config import Variables
from typing import Optional  # Add this import for compatibility with older Python versions

class ChatMessage(BaseModel):
    chat: str
    text: str
    tag: Optional[str]  # Replace 'str | None' with 'Optional[str]'
    sender: str
    timestamp: str

class MessagesRepository:
    def __init__(self, db):
        self.collection = db[Variables.MONGO_MESSAGES_COLLECTION]

    def save_message(self, message: dict):
        self.collection.insert_one(message)

    def get_messages(self, chat: str, tag: str):
        messages = list(self.collection.find({"chat": chat}).sort("timestamp", -1))
        filtered_messages = []
        for message in messages:
            if message.get("tag") == tag or message.get("tag") is None:
                message["_id"] = str(message["_id"])
                filtered_messages.append(message)
        return filtered_messages[::-1]