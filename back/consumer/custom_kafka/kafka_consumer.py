from aiokafka import AIOKafkaConsumer
from config.config import Variables
import asyncio
from pydantic import BaseModel
import json

consumer = AIOKafkaConsumer(
    "test-topic",
    bootstrap_servers="localhost:29092",
    group_id="my-consumer-group",
    auto_offset_reset="earliest"
)

async def subscribe_to_topic(topic):
    consumer.subscribe([topic])
    print(f"Subscribed to topic: {topic}")

async def subscribe_to_chat(chat):
    subscribe_to_topic(f'{Variables.KAFKA_CHAT_TOPIC_PREFIX}.{chat}')
    
async def consume_messages(consumer):
    await consumer.start()
    try:
        async for raw_message in consumer:
            raw_messsage_value = raw_message.value().decode('utf-8')
            message = Message(**json.loads(raw_messsage_value))
            
            handle_message(raw_message.topic(), message)
    finally:
        await consumer.stop()
        
def handle_message(topic, message):

    print(f"Handling message: {message}")
    
class Message(BaseModel):
    sender: str
    text: str
    tag: str