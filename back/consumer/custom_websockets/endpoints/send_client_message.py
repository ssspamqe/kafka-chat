from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from config.logger_config import logger
from custom_kafka.kafka_consumer import consume_messages, create_consumer
import config.config as config
import requests

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/receive-messages/user/{username}")
async def send_person_message(websocket: WebSocket, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    await websocket.accept()
    if username in state.consumers:
        logger.warning(f"The user {username} already has a connection")
        await websocket.close()
        return
    logger.info(f"WebSocket connection established with user: {username}")

    # Получение данных о пользователе из MongoDB через сервис
    try:
        response = requests.get(f'http://{config.MONGODB_SERVICE_HOST}:{config.MONGODB_PORT}/user/{username}')
        response.raise_for_status()
        message = response.json()
    except requests.RequestException as e:
        logger.error(f"Ошибка при запросе данных пользователя {username}: {e}")
        await websocket.close()
        return

    chats = message.get('chats', [])

    # MOCK, нижнее удалить, когда будет подгрузка из mongodb
    # consumer = await create_consumer([f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{username}', f'{config.KAFKA_GLOBAL_TOPIC}'])
    consumer = await create_consumer(chats) # Условно потом будет это, когда подгрузим

    state.consumers[username] = consumer

    await consume_messages(consumer, websocket)

    state.consumers.pop(username, None)

    logger.info(f"WebSocket connection closed for user: {username}")
    await websocket.close()


