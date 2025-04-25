from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config.logger_config import logger
from custom_kafka.kafka_consumer import consume_messages, get_consumer
from config.config import KAFKA_CONFIG

router = APIRouter()
state = None

def initialize_state(app_state):
    global state
    state = app_state

@router.websocket("/send-message/client/{topic}")
async def send_person_message(websocket: WebSocket, topic: str):
    await websocket.accept()
    logger.info(f"WebSocket connection established with topic: {topic}")

    if state:
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
