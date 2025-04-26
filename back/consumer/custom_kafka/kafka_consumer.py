from aiokafka import AIOKafkaConsumer
import config.config as config
import asyncio
from pydantic import BaseModel
from config.logger_config import logger
import json
from fastapi import WebSocket, WebSocketDisconnect

async def create_consumer():
    logger.info("Creating Kafka consumer...")
    consumer = AIOKafkaConsumer(
    config.KAFKA_GLOBAL_TOPIC,
    bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
    group_id=config.KAFKA_CONSUMER_GROUP,
    auto_offset_reset=config.KAFKA_OFFSET_RESET,  
    enable_auto_commit=False)
    if not consumer:
        logger.error("Failed to create Kafka consumer.")
    else:
        logger.info("Kafka consumer created successfully.")
    return consumer

async def subscribe_to_topic(consumer, topic):
    consumer.subscribe([topic])
    logger.info(f"Subscribed to topic: {topic}")

async def subscribe_to_chat(consumer, chat):
    await subscribe_to_topic(consumer, f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{chat}')
    logger.info(f"Subscribed to chat topic: {chat}")

async def consume_messages(consumer, websockets):
    logger.info("Starting Kafka consumer...")
    # Retry consumer.start() to handle Kafka startup delays
    max_retries = 5
    retry_delay = 5  # seconds
    for attempt in range(max_retries):
        try:
            await consumer.start()
            logger.info("Started Kafka consumer successfully.")
            break
        except Exception as e:
            logger.error(f"Failed to start Kafka consumer (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying start in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.critical("Exceeded maximum retries for starting Kafka consumer.")
                raise
    try:
        logger.info("Consuming messages...")
        logger.info(f"Active consumer: {consumer}")
        async for raw_message in consumer:
            logger.info(f"Received raw message: {raw_message.value}")
            raw_message_value = raw_message.value.decode('utf-8')
            message = Message(**json.loads(raw_message_value))
            
            handle_message(raw_message.topic(), message, websockets)
            logger.info(f"Consumed message from topic {raw_message.topic()}: {message}")
            await consumer.commit()
    finally:
        await consumer.stop()

def handle_message(topic, message, websockets):
    try:
        if topic in websockets:
            for websocket in list(websockets[topic]):
                try:
                    asyncio.create_task(websocket.send_text(message.json()))
                    logger.info(f"Sent message to WebSocket: {message}")
                except WebSocketDisconnect:
                    logger.error(f"WebSocket connection closed unexpectedly for topic: {topic}")
                    websockets[topic].remove(websocket)
            if not websockets[topic]:
                del websockets[topic]
        else:
            logger.warning(f"No active WebSocket connections for topic: {topic}")
    except Exception as e:
        logger.error(f"Error handling message for topic {topic}: {e}")
    print(f"Handling message: {message}")
    
class Message(BaseModel):
    sender: str
    text: str
    tag: str