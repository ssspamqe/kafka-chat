from prometheus_client import Counter, Histogram
import time
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from config.logger_config import logger
from custom_kafka.kafka_consumer import consume_messages, create_consumer
import config.config as config
import requests

router = APIRouter()
state = None

WS_CONNECTIONS = Counter(
    'websocket_connections_total',
    'Total number of WebSocket connection attempts',
    ['username']
)

WS_LATENCY = Histogram(
    'websocket_connection_duration_seconds',
    'Duration of WebSocket connections',
    ['username'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/receive-messages/user/{username}")
async def send_person_message(websocket: WebSocket, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    WS_CONNECTIONS.labels(username=username).inc()
    start_time = time.time()

    await websocket.accept()
    if username in state.consumers:
        logger.warning(f"The user {username} already has a connection")
        await websocket.close()
        return

    logger.info(f"WebSocket connection established with user: {username}")

    try:
        response = requests.get(f'http://{config.MONGODB_SERVICE_HOST}:{config.MONGODB_PORT}/user/{username}')
        response.raise_for_status()
        message = response.json()
    except requests.RequestException as e:
        logger.error(f"Ошибка при запросе данных пользователя {username}: {e}")
        await websocket.close()
        return

    chats = message.get('chats', [])
    tag = message.get('tag', None)

    consumer = await create_consumer(chats)

    state.consumers[username] = consumer

    await consume_messages(consumer, websocket, username)

    state.consumers.pop(username, None)

    logger.info(f"WebSocket connection closed for user: {username}")
    await websocket.close()

    duration = time.time() - start_time
    WS_LATENCY.labels(username=username).observe(duration)


