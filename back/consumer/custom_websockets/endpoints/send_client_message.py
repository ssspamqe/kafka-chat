from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config.logger_config import logger
from custom_kafka.kafka_consumer import subscribe_to_chat, consume_messages, create_consumer
import config.config as config
from asyncio import sleep

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/send-message/client/{chat}")
async def send_person_message(websocket: WebSocket, chat: str):
    logger.info(f"WebSocket connection request for chat: {chat}")
    await websocket.accept()
    logger.info(f"WebSocket connection established with topic: {chat}")
    
    consumer = await create_consumer()

    if chat != "global":
        await subscribe_to_chat(consumer, chat)

    await consume_messages(consumer, websocket)

    logger.info(f"Subscribed to chat topic: {chat}")

    
