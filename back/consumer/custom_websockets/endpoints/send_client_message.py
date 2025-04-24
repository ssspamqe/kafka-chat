from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from back.consumer.config import config
from back.consumer.config.logger_config import logger
from back.consumer.kafka.kafka_consumer import create_consumer, consume_messages, conf, close_consumer

router = APIRouter()

@router.websocket("/send-message/client/{receiver}")
async def send_person_message(websocket: WebSocket, receiver: str):
    logger.info("WebSocket endpoint /send-message/client/{receiver} is being initialized.")
    await websocket.accept()
    logger.info(f"/send-message/client/{receiver} connected")
    logger.info("WebSocket endpoint /send-message/client/{receiver} is now active.")

    consumer = create_consumer(conf, f"user_topic_{receiver}")
    try:
        await consume_messages(consumer, websocket)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from /send-message/client/{receiver}")
    finally:
        close_consumer(consumer)
