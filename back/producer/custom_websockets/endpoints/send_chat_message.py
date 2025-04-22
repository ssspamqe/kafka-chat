from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from kafka import kafka_producer
import json
import logging

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")

@router.websocket("/send-message/chat/{chat}")
async def send_message_to_chat(websocket:WebSocket, chat:str):
    await websocket.accept()
    logger.info("/send-message/chat/{chat} connected")
    try:
        while True:
            raw_send_message_json = await websocket.receive_text()
            logger.info(f"Received raw message: {raw_send_message_json}")
            
            send_message_request = parse_send_chat_message_request(raw_send_message_json)
            
            chat = send_message_request.chat
            message = kafka_producer.Message(sender=send_message_request.sender, text=send_message_request.text)
            
            kafka_producer.send_message_to_chat(chat,message)
            
    except WebSocketDisconnect:
        logger.info(f"{websocket.user} disconnected")


def parse_send_chat_message_request(raw_data: str):
    data = json.loads(raw_data)
    return SendChatMessageRequest(sender=data["sender"], text=data["text"], chat=data["chat"], tag=data["tag"])
  
          
class SendChatMessageRequest:
    def __init__(self, sender: str, text: str, chat: str, tag:str):
        self.sender = sender
        self.text = text
        self.chat = chat
        self.tag = tag
