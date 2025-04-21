from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from kafka import kafka_producer
import json
import logging

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")

@router.websocket("/send-message/global")
async def send_message_to_global(websocket:WebSocket):
    await websocket.accept()
    logger.info("/send-message/global connected")
    try:
        while True:
            raw_send_message_json = await websocket.receive_text()
            logger.info(f"Received raw message: {raw_send_message_json}")
            
            send_message_request = parse_send_global_message_request(raw_send_message_json)
            
            message = kafka_producer.Message(sender=send_message_request.sender, text=send_message_request.text)
            
            kafka_producer.send_message_to_global(message)
            
    except WebSocketDisconnect:
        logger.info(f"{websocket.user} disconnected")


def parse_send_global_message_request(raw_data: str):
    data = json.loads(raw_data)
    return SendGlobalMessageRequest(sender=data["sender"], text=data["text"], tag = data["tag"])
    
    
class SendGlobalMessageRequest:
    def __init__(self, sender: str, text: str, tag:str):
        self.text = text
        self.sender = sender
        self.tag = tag
