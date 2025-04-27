from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from config.logger_config import logger
from custom_kafka.kafka_consumer import consume_messages, create_consumer
import config.config as config

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/send-messages/user/{username}")
async def send_person_message(websocket: WebSocket, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    await websocket.accept()
    logger.info(f"WebSocket connection established with user: {username}")

    # Здесь надо будет добавить подгрузку topics из mongodb
    # topics = requests.get(f'http://{config.MONGODB_HOST}:{config.MONGODB_PORT}/user/{username}')

    topics = []

    # MOCK, нижнее удалить, когда будет подгрузка из mongodb
    consumer = await create_consumer([f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{username}', f'{config.KAFKA_GLOBAL_TOPIC}'])
    #consumer = await create_consumer(topics) # Условно потом будет это, когда подгрузим

    state.consumers[username] = consumer

    await consume_messages(consumer, websocket)

    state.consumers.pop(username, None)

    logger.info(f"WebSocket connection closed for user: {username}")
    await websocket.close()

    
