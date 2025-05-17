from prometheus_client import Counter, Histogram
import time
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from config.logger_config import logger
from custom_kafka.kafka_consumer import subscribe_to_chat
import requests
from config import config as config

router = APIRouter()
state = None

SUBSCRIBE_COUNT = Counter(
    'chat_subscriptions_total',
    'Total number of chat subscriptions',
    ['username', 'chat']
)

SUBSCRIBE_LATENCY = Histogram(
    'chat_subscription_latency_seconds',
    'Latency of chat subscription endpoint',
    ['username', 'chat'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)


class Message(BaseModel):
    user: str
    chats: list[str]
    message: str

def initialize_state(app_state):
    global state
    state = app_state

@router.post("/subscribing/{username}/{chat}")
async def subscribe_user(chat: str, username: str):
    logger.info(f"WebSocket connection request for user: {username}")
    logger.info(f"Subscribing user {username} to chat: {chat}")

    SUBSCRIBE_COUNT.labels(username=username, chat=chat).inc()
    start_time = time.time()

    if username not in state.consumers:
        logger.warning(f"No consumer found for user: {username}")
    else:
        await subscribe_to_chat(state.consumers[username], chat, username)

    logger.info(f"Subscribed user {username} to chat: {chat}")
    duration = time.time() - start_time
    SUBSCRIBE_LATENCY.labels(username=username, chat=chat).observe(duration)

    return {"message": "nonono mr fish you dont want to go to this bucket"} 
