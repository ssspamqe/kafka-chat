from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from confluent_kafka import KafkaAdminClient, NewTopic, Producer
from aiokafka import AIOKafkaProducer
import asyncio
from config.logger_config import logger

class Message:
    def __init__(self, sender: str, text: str, tag:str):
        self.sender = sender
        self.text = text
        self.tag = tag

config = {
    'bootstrap.servers': 'localhost:9092',
}

producer = Producer(config)

def send_message_to_global(message:Message):
    topic_name='kafka.chat.global'
    
    logger.info(f"Sending global message to topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, message.encode('utf-8'))
    
    producer.flush()
    
def send_message_to_chat(chat, message:Message):
    topic_name = f'kafka.chat.room.{chat}'
    
    logger.info(f"Sending message to chat {chat} in topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, message.encode('utf-8'))
    
    producer.flush()