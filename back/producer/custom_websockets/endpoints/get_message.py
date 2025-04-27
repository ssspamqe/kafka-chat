from fastapi import APIRouter
from back.services.mongo_service import MongoService
from typing import List
from services.models.mongo_models import ChatMessage
import logging

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")
mongo_service = MongoService()

@router.get("/get-messages/chat/{chat}", response_model=List[ChatMessage])
async def get_chat_messages(chat: str, limit: int = 100):
    """get messages from the chat"""
    try:
        messages = mongo_service.get_chat_messages(chat, limit)
        return messages
    except Exception as e:
        logger.error(f"Error getting messages for chat {chat}: {str(e)}")
        raise

@router.get("/get-user-chats/{username}")
async def get_user_chats(username: str):
    """get the list of user's chats"""
    try:
        chats = mongo_service.get_user_chats(username)
        return {"chats": chats}
    except Exception as e:
        logger.error(f"Error getting chats for user {username}: {str(e)}")
        raise