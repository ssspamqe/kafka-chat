from bson import ObjectId 
from pydantic import BaseModel
from config.config import Variables
from typing import Optional 
from prometheus_client import Counter, Histogram
import time

MONGO_MESSAGE_OPS = Counter(
    'mongo_message_operations_total',
    'Message collection operations',
    ['operation']
)

MONGO_MESSAGE_LATENCY = Histogram(
    'mongo_message_latency_seconds',
    'Message operation latency',
    ['operation']
)

class ChatMessage(BaseModel):
    chat: str
    text: str
    tag: Optional[str] 
    sender: str
    timestamp: str

class MessagesRepository:
    def __init__(self, db):
        self.collection = db[Variables.MONGO_MESSAGES_COLLECTION]

    def save_message(self, message: dict):
        start_time = time.time()
        try:
            self.collection.insert_one(message)
            MONGO_MESSAGE_OPS.labels(operation='insert').inc()
        finally:
            MONGO_MESSAGE_LATENCY.labels(operation='insert').observe(time.time() - start_time)

    def get_messages(self, chat: str, tag: str):
        start_time = time.time()
        try:
            messages = list(self.collection.find({"chat": chat}).sort("timestamp", -1))
            filtered_messages = []
            for message in messages:
                if message.get("tag") == tag or message.get("tag") is None:
                    message["_id"] = str(message["_id"])
                    filtered_messages.append(message)
            MONGO_MESSAGE_OPS.labels(operation='find').inc()
            return filtered_messages[::-1]
        finally:
            MONGO_MESSAGE_LATENCY.labels(operation='find').observe(time.time() - start_time)