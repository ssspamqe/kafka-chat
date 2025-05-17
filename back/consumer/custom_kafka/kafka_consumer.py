import time
from prometheus_client import Counter, Histogram, Gauge
from aiokafka import AIOKafkaConsumer
import config.config as config
import asyncio
from config.logger_config import logger
import json
from fastapi import WebSocket, WebSocketDisconnect
import uuid
import requests

MESSAGES_CONSUMED = Counter(
    'kafka_messages_consumed_total',
    'Total messages consumed from Kafka',
    ['topic']
)

CONSUME_LATENCY = Histogram(
    'kafka_consume_latency_seconds',
    'Latency of Kafka consume operations',
    ['topic'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

async def create_consumer(chats=None):
    if chats is None or chats == [] or chats == ["global"]:
        chats = [config.KAFKA_GLOBAL_CHAT]
    logger.info("Creating Kafka consumer...")
    unique_group_id = str(uuid.uuid4())
    for index, chat in enumerate(chats):
        chats[index] = f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{chat}'
    logger.info(f"Subscribing to topics: {chats}")
    consumer = AIOKafkaConsumer(
    *chats,
    bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
    group_id=unique_group_id,
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

async def subscribe_to_chat(consumer, chat, username):
    await subscribe_to_topic(consumer, f'{config.KAFKA_CHAT_TOPIC_PREFIX}.{chat}')
    response = requests.post(
        f'http://{config.MONGODB_SERVICE_HOST}:{config.MONGODB_PORT}/subscription',
        json={"chat": chat, "username": username}
    )
    if response.status_code == 200:
        logger.info(f"Successfully notified MongoDB service about subscription to chat: {chat}")
    else:
        logger.error(f"Failed to notify MongoDB service about subscription to chat: {chat}. Status code: {response.status_code}")
    logger.info(f"Subscribed to chat topic: {chat}")
    
async def consume_messages(consumer, websocket, username):
    try:
        await consumer.start()
        async for message in consumer:
            start_time = time.time()
            tag = None
            response = requests.get(f'http://{config.MONGODB_SERVICE_HOST}:{config.MONGODB_PORT}/tag/{username}')
            if response.status_code == 200:
                response_data = response.json()
                tag = response_data.get('tag', None)
                logger.info(f"Received tag for user {username}: {tag}")
            else:
                logger.error(f"Failed to retrieve tag for user {username}. Status code: {response.status_code}")
            topic = message.topic
            structured_message = json.loads(message.value.decode('utf-8'))
            structured_message["chat"] = topic[len(config.KAFKA_CHAT_TOPIC_PREFIX) + 1:]
            msg_tag = structured_message.get("tag", None)
            if tag != msg_tag and msg_tag != None:
                logger.info(f"Message tag {msg_tag} does not match user tag {tag}. Skipping message.")
                continue
            logger.info(f"Received message: {structured_message}")

            try:
                await websocket.send_json(structured_message)
                logger.info(f"Sent structured message to WebSocket: {structured_message}")
                MESSAGES_CONSUMED.labels(topic=topic).inc()
                CONSUME_LATENCY.labels(topic=topic).observe(time.time() - start_time)
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for topic: {topic}")

    except asyncio.CancelledError:
        logger.warning("Message consumption cancelled.")
    except Exception as e:
        logger.error(f"Error consuming messages: {e}")
    finally:
        await consumer.stop()
        logger.info("Kafka consumer stopped.")

