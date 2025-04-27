from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from config.logger_config import logger
from custom_kafka.kafka_consumer import subscribe_to_chat
import requests
from config import config as config

router = APIRouter()
state = None

class Message(BaseModel):
    user: str
    chats: list[str]
    message: str

def initialize_state(app_state):
    global state
    state = app_state

@router.post("/subscribing/{username}")
async def subscribe_user(chat: str, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    logger.info(f"Subscribing user {username} to chat: {chat}")
    if username not in state.consumers:
        logger.warning(f"No consumer found for user: {username}")
    else:
        await subscribe_to_chat(state.consumers[username], chat, username)
        logger.info(f"Subscribed user {username} to chat: {chat}")

    return {"message": "nonono mr fish you dont want to go to this bucket"} 

@router.post("/change-tag/{username}")
async def change_tag(tag: str, username: str):
    logger.info(f"Changing tag for user {username} to {tag}")
    if username not in state.tags:
        logger.warning(f"No tag found for user: {username}")
    else:
        state.tags[username] = tag
        logger.info(f"Changed tag for user {username} to {tag}")

    response = requests.post(f"http://{config.MONGODB_SERVICE_HOST}:{config.MONGODB_PORT}/tag/{username}", json={"tag": tag})
    if response.status_code == 200:
        logger.info(f"Successfully notified MongoDB service about tag change for user: {username}")
    else:
        logger.error(f"Failed to notify MongoDB service about tag change for user: {username}. Status code: {response.status_code}")
    return {"message": "just do it, mr fish"}