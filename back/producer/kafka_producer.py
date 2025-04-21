from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from confluent_kafka import KafkaAdminClient, NewTopic, Producer
from aiokafka import AIOKafkaProducer
import asyncio

class Message:
    def __init__(self, sender: str, text: str):
        self.sender = sender
        self.text = text

class TaggedMessage(Message):
    def __init__(self, sender: str, text: str, tag: str):
        super().__init__(sender, text) 
        self.tag = tag 

config = {
    'bootstrap.servers': 'localhost:9092',
}

producer = Producer(config)

def send_tagged_message(message:TaggedMessage):
    topic_name = f'kafka.chat.tagged'
    producer.produce(topic_name, message.encode('utf-8'))
    producer.flush()
    

def send_tagged_message(message:Message, tag):
    send_tagged_message(TaggedMessage(message.sender, message.text, tag))

def send_message_to_global(message:Message):
    topic_name='kafka.chat.global'
    producer.produce(topic_name, message.encode('utf-8'))
    producer.flush()
    

def send_message_to_chat(chat, message):
    topic_name = f'kafka.chat.room.{chat}'
    producer.produce(topic_name, message.encode('utf-8'))
    producer.flush()