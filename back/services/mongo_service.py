from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict
import logging

logger = logging.getLogger("kafka_chat_logger")

class MongoService:
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", db_name: str = "chat_db"):
        self.client = MongoClient(connection_string)
        self.db = self.client[db_name]
        self.users_collection = self.db["user_chats"]
        self.messages_collection = self.db["chat_messages"]
        self._create_indexes()

    def _create_indexes(self):
        self.messages_collection.create_index([("chat", 1), ("timestamp", -1)])
        self.users_collection.create_index("username", unique=True)

    def save_message(self, chat: str, sender: str, text: str, tag: str) -> bool:
        """save messages to database"""
        try:
            # 1. update the list of user's chats
            self.users_collection.update_one(
                {"username": sender},
                {"$addToSet": {"chats": chat}},
                upsert=True
            )
            
            # 2. save message
            self.messages_collection.insert_one({
                "chat": chat,
                "text": text,
                "timestamp": datetime.now(),
                "tag": tag,
                "sender": sender
            })
            return True
        except Exception as e:
            logger.error(f"Error saving message to MongoDB: {str(e)}")
            return False

    def get_chat_messages(self, chat: str, limit: int = 100) -> List[Dict]:
        """get messages from the chat"""
        try:
            messages = list(self.messages_collection.find(
                {"chat": chat},
                {"_id": 0}
            ).sort("timestamp", -1).limit(limit))
            return messages
        except Exception as e:
            logger.error(f"Error getting chat messages: {str(e)}")
            return []

    def get_user_chats(self, username: str) -> List[str]:
        """get the list of user's chats"""
        try:
            user_data = self.users_collection.find_one(
                {"username": username},
                {"_id": 0, "chats": 1}
            )
            return user_data.get("chats", []) if user_data else []
        except Exception as e:
            logger.error(f"Error getting user chats: {str(e)}")
            return []