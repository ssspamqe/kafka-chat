from prometheus_client import Counter
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from custom_kafka import kafka_producer
import json
import logging

WS_CONNECTIONS = Counter(
    'websocket_connections_total',
    'Total WebSocket connections',
    ['endpoint']
)

WS_MESSAGES = Counter(
    'websocket_messages_received_total',
    'Total messages received via WebSocket',
    ['endpoint']
)

WS_ERRORS = Counter(
    'websocket_errors_total',
    'Total WebSocket errors',
    ['error_type']
)

router = APIRouter()
logger = logging.getLogger("kafka_chat_logger")

@router.websocket("/send-message/chat/{chat}")
async def send_message_to_chat(websocket:WebSocket, chat:str):
    await websocket.accept()
    WS_CONNECTIONS.labels(endpoint=f"/send-message/chat/{chat}").inc()
    logger.info("/send-message/chat/{chat} connected")
    try:
        while True:
            raw_send_message_json = await websocket.receive_text()
            WS_MESSAGES.labels(endpoint=f"/send-message/chat/{chat}").inc()
            logger.info(f"Received raw message: {raw_send_message_json}")
            
            try:
                send_message_request = parse_send_chat_message_request(raw_send_message_json)
                
                message = kafka_producer.Message(sender=send_message_request.sender, text=send_message_request.text, tag=send_message_request.tag)
                
                kafka_producer.send_message_to_chat(chat,message)
            except Exception as e:
                WS_ERRORS.labels(error_type="message_processing").inc()
                logger.error(f"Failed to process message: {str(e)}")
                raise
            
    except WebSocketDisconnect:
        logger.info(f"{websocket.user} disconnected")
    except Exception as e:
        WS_ERRORS.labels(error_type=type(e).__name__).inc()
        logger.error(f"WebSocket error: {str(e)}")
        raise


def parse_send_chat_message_request(raw_data: str):
    data = json.loads(raw_data)
    return SendChatMessageRequest(sender=data["sender"], text=data["text"], tag=data["tag"])
  
          
class SendChatMessageRequest:
    def __init__(self, sender: str, text: str, tag:str):
        self.sender = sender
        self.text = text
        self.tag = tag