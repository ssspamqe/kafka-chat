from collections import defaultdict
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

# Maintain a mapping of topics to active WebSocket connections
active_websockets = defaultdict(list)

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

        # Add the WebSocket connection to the active list for the topic
        active_websockets[topic].append(websocket)

    try:
        while True:
            if consumer:
                message = await consume_messages(consumer)
                if message:
                    logger.info(f"Broadcasting message to topic {topic}: {message}")
                    # Broadcast the message to all active WebSocket connections for the topic
                    for ws in active_websockets[topic]:
                        try:
                            await ws.send_text(message)
                        except WebSocketDisconnect:
                            logger.info(f"WebSocket disconnected for topic {topic}")
                            active_websockets[topic].remove(ws)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from topic {topic}.")
        active_websockets[topic].remove(websocket)
    except Exception as e:
        logger.error(f"Error in WebSocket connection with topic {topic}: {e}")
    finally:
        logger.info(f"Closing WebSocket connection with topic {topic}.")
        if websocket in active_websockets[topic]:
            active_websockets[topic].remove(websocket)
