from aiokafka import AIOKafkaConsumer
import config.config as config
import asyncio
from pydantic import BaseModel
from config.logger_config import logger
import json
from fastapi import WebSocket, WebSocketDisconnect

async def create_consumer(topic = config.KAFKA_GLOBAL_TOPIC):
    logger.info("Creating Kafka consumer...")
    consumer = AIOKafkaConsumer(
    topic,
    bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
    group_id=config.KAFKA_CONSUMER_GROUP,
    auto_offset_reset=config.KAFKA_OFFSET_RESET,  
    enable_auto_commit=True)
    if not consumer:
        logger.error("Failed to create Kafka consumer.")
    else:
        logger.info("Kafka consumer created successfully.")
    return consumer

async def subscribe_to_topic(consumer, topic):
    current_subscription = consumer.subscription()
    
    if topic in current_subscription:
        logger.info(f"Already subscribed to topic: {topic}")
        return
    
    new_subscription = list(current_subscription) + [topic]
    consumer.subscribe(new_subscription)
    logger.info(f"Subscribed to topic: {topic}. Current topics: {new_subscription}")

async def subscribe_to_chat(consumer, chat):
    await subscribe_to_topic(consumer, f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{chat}')
    logger.info(f"Subscribed to chat topic: {chat}")
    
async def consume_messages(consumer, websocket):
    try:
        await consumer.start()
        async for message in consumer:
            logger.info(f"Received message: {message.value.decode('utf-8')}")
            try:
                await websocket.send_text(message.value.decode('utf-8'))
                logger.info(f"Sent message to {message.topic}: {message.value.decode('utf-8')}")
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for topic: {message.topic}")
    except asyncio.CancelledError:
        logger.warning("Message consumption cancelled.")
    except Exception as e:
        logger.error(f"Error consuming messages: {e}")
    finally:
        await consumer.stop()
        logger.info("Kafka consumer stopped.")  