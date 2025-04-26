from fastapi import FastAPI
from custom_websockets.endpoints.send_client_message import router as client_router
from custom_websockets.endpoints.send_client_message import initialize_state
import asyncio
from contextlib import asynccontextmanager
from config.logger_config import logger
from custom_kafka.kafka_consumer import create_consumer, consume_messages

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI application startup event triggered.")
    logger.info("Creating temporary state for FastAPI application.")

    app.state.active_websockets = {}

    max_retries = 5
    retry_delay = 5  # seconds

    for attempt in range(max_retries):
        try:
            app.state.consumer = await create_consumer()
            logger.info("Kafka consumer created successfully.")
            break
        except Exception as e:
            logger.error(f"Failed to create Kafka consumer on attempt {attempt + 1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.critical("Exceeded maximum retries. Kafka consumer could not be created.")
                raise

    initialize_state(app.state)

    # consume_messages_task = asyncio.create_task(consume_messages(app.state.consumer, app.state.active_websockets))

    await consume_messages(app.state.consumer, app.state.active_websockets)

    try:
        yield
    except asyncio.CancelledError:
        logger.warning("Application shutdown interrupted by CancelledError.")
    finally:
        logger.info("FastAPI application shutdown event triggered.")
        logger.info("Stopping Kafka consumer...")
        # consume_messages_task.cancel()
        # try:
        #     await consume_messages_task
        # except asyncio.CancelledError:
        #     logger.info("Background task cancelled successfully.")
        logger.info("Kafka consumes closed.")
        await app.state.consumer.stop()
        logger.info("Kafka consumer stopped.")
        logger.info("Closing connections...")
        for topic, websockets in app.state.active_websockets.items():
            for websocket in websockets:
                try:
                    await websocket.close()
                    logger.info(f"WebSocket connection closed for topic: {topic}")
                except Exception as e:
                    logger.error(f"Error closing WebSocket connection for topic {topic}: {e}")
        logger.info("All WebSocket connections closed.")
        logger.info("FastAPI application shutdown completed.")

app = FastAPI(lifespan=lifespan)

app.include_router(client_router)

@app.get("/health")
async def health_check():
    return {"status": "Consumer is running"}

