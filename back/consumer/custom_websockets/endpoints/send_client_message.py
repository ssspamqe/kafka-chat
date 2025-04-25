from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config.logger_config import logger
from custom_kafka.kafka_consumer import consume_messages, get_consumer
from config.config import KAFKA_CONFIG
from config.config import Variables

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/send-message/client/{chat}")
async def send_person_message(websocket: WebSocket, chat: str):
    await websocket.accept()
    logger.info(f"WebSocket connection established with topic: {chat}")

    if state:
        topic = f'{Variables.KAFKA_CHAT_TOPIC_PREFIX}.{chat}' if chat != 'global' else Variables.KAFKA_GLOBAL_TOPIC
        consumer = state.kafka_consumers.get(topic)
        if not consumer:
            logger.info(f"No consumer found for {topic}, creating one...")
            consumer = get_consumer(state.kafka_consumers, KAFKA_CONFIG, topic)
            state.kafka_consumers[topic] = consumer

    try:
        while True:
            if consumer:
                message = await consume_messages(consumer)
                if message:
                    logger.info(f"Sending message to topic {topic}: {message}")
                    await websocket.send_text(message)
    except WebSocketDisconnect:
        logger.info(f"Client {topic} disconnected.")
    except Exception as e:
        logger.error(f"Error in WebSocket connection with {topic}: {e}")
    finally:
        logger.info(f"Closing WebSocket connection with {topic}.")
