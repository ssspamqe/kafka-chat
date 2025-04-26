from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config.logger_config import logger
from custom_kafka.kafka_consumer import subscribe_to_topic
import config.config as config
from asyncio import sleep

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/send-message/client/{chat}")
async def send_person_message(websocket: WebSocket, chat: str):
    await websocket.accept()
    logger.info(f"WebSocket connection established with topic: {chat}")

    topic = f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{chat}' if chat != 'global' else config.KAFKA_GLOBAL_TOPIC
    await subscribe_to_topic(state.consumer, topic)

    if topic not in state.active_websockets:
        state.active_websockets[topic] = []
    
    state.active_websockets[topic].append(websocket)
    logger.info(f"WebSocket added to topic: {topic}. Total connections: {len(state.active_websockets[topic])}")
    try:
        while True:
            await sleep(1)
    except WebSocketDisconnect:
        logger.info(f"WebSocket connection closed for topic: {topic}")
        state.active_websockets[topic].remove(websocket)
        if not state.active_websockets[topic]:
            del state.active_websockets[topic]
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        await websocket.close()
        logger.info(f"WebSocket connection closed for topic: {topic}")
        state.active_websockets[topic].remove(websocket)
        if not state.active_websockets[topic]:
            del state.active_websockets[topic]