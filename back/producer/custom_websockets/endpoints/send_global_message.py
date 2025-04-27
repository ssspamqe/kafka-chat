from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from custom_kafka import kafka_producer
import json
import logging
import httpx
import os
from datetime import datetime

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")

MONGO_SERVICE_URL = os.getenv("MONGO_SERVICE_URL", "http://mongo-service:8000")

async def save_to_mongo(chat: str, sender: str, text: str, tag: str):
    """helper function to save message via MongoDB service API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MONGO_SERVICE_URL}/messages",
                json={
                    "chat": chat,
                    "sender": sender,
                    "text": text,
                    "tag": tag,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                },
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"MongoDB service error: {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB service: {str(e)}")
        raise

@router.websocket("/send-message/global")
async def send_message_to_global(websocket: WebSocket):
    await websocket.accept()
    logger.info("/send-message/global connected")
    
    try:
        while True:
            raw_send_message_json = await websocket.receive_text()
            logger.info(f"Received raw message: {raw_send_message_json}")
            
            send_message_request = parse_send_global_message_request(raw_send_message_json)
            
            # save to MongoDB via HTTP API
            await save_to_mongo(
                chat="global",
                sender=send_message_request.sender,
                text=send_message_request.text,
                tag=send_message_request.tag
            )
            
            # send to Kafka
            message = kafka_producer.Message(
                sender=send_message_request.sender,
                text=send_message_request.text,
                tag=send_message_request.tag
            )
            kafka_producer.send_message_to_global(message)
            
    except WebSocketDisconnect:
        logger.info("Client disconnected from global chat")
    except Exception as e:
        logger.error(f"Error in global WebSocket handler: {str(e)}")
        await websocket.close(code=1011)

def parse_send_global_message_request(raw_data: str):
    data = json.loads(raw_data)
    return SendGlobalMessageRequest(
        sender=data["sender"],
        text=data["text"],
        tag=data["tag"]
    )
    
class SendGlobalMessageRequest:
    def __init__(self, sender: str, text: str, tag: str):
        self.sender = sender
        self.text = text
        self.tag = tag