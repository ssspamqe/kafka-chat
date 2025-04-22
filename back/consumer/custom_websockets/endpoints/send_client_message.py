from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from kafka.kafka_consumer import create_consumer, consume_messages
import logging

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")

@router.websocket("/send-message/client/{receiver}")
async def send_person_message(websocket: WebSocket, receiver: str):
    await websocket.accept()
    logger.info(f"/send-message/client/{receiver} connected")

    consumer = create_consumer({"group.id": f"{receiver}-consumer-group"}, f"user_topic_{receiver}")
    try:
        consume_messages(consumer, websocket)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from /send-message/client/{receiver}")
    finally:
        consumer.close()
