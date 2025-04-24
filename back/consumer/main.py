from back.consumer.config.config import Variables
from back.consumer.config.logger_config import logger
from fastapi import FastAPI
from back.consumer.custom_websockets.endpoints.send_client_message import router as client_router
from back.consumer.kafka.kafka_consumer import create_consumer, subscribe_to_topic, consume_messages, conf
import uvicorn
import asyncio

app = FastAPI()

logger.info("Starting the FastAPI application...")

app.include_router(client_router)

async def start_consumer():
    topic = "kafka.chat.global"
    consumer = create_consumer(conf, topic)
    subscribe_to_topic(consumer, topic)

    print(f"Consumer started for topic: {topic}")

    try:
        await consume_messages(consumer, None)
    except Exception as e:
        print(f"Error while consuming messages: {e}")
    finally:
        consumer.close()

if __name__ == "__main__":
    asyncio.run(start_consumer())
    uvicorn.run(app, host="0.0.0.0", port=8001)
    logger.info("FastAPI application is running.")
