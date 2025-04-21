from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from confluent_kafka import KafkaAdminClient, NewTopic, Producer
from aiokafka import AIOKafkaProducer
import asyncio
from config import config
from config.logger_config import logger

class Message:
    def __init__(self, sender: str, text: str, tag:str):
        self.sender = sender
        self.text = text
        self.tag = tag

producer_config = {
    'bootstrap.servers': config.Variables.KAFKA_BOOTSTRAP_SERVERS
}

producer = Producer(producer_ config)

def send_message_to_global(message:Message):
    topic_name=config.Variables.KAFKA_GLOBAL_TOPIC
    
    logger.info(f"Sending global message to topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, message.encode('utf-8'))
    
    producer.flush()
    
def send_message_to_chat(chat, message:Message):
    topic_name = f'{config.Variables.KAFKA_CHAT_TOPIC_PREFIX}.{chat}'
    
    logger.info(f"Sending message to chat {chat} in topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, message.encode('utf-8'))
    
    producer.flush()