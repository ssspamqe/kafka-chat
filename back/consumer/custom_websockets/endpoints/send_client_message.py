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

@router.websocket("/send-message/client/{username}")
async def send_person_message(websocket: WebSocket, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    await websocket.accept()
    logger.info(f"WebSocket connection established with user: {username}")

    # Здесь надо будет добавить подгрузку topics из mongodb

    topics = []

    # MOCK, нижнее удалить, когда будет подгрузка из mongodb
    consumer = await create_consumer([f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{username}', f'{config.KAFKA_GLOBAL_TOPIC}'])
    #consumer = await create_consumer(topics) # Условно потом будет это, когда подгрузим

    await consume_messages(consumer, websocket)

    logger.info(f"WebSocket connection closed for user: {username}")
    await websocket.close()

    
