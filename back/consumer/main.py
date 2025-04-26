from fastapi import FastAPI
from custom_websockets.endpoints.send_client_message import router as client_router
from custom_websockets.endpoints.send_client_message import initialize_state
import asyncio
from contextlib import asynccontextmanager
from config.logger_config import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI application startup event triggered.")
    logger.info("Creating temporary state for FastAPI application.")
    app.state.kafka_consumers = {}  # topic -> consumer
    app.state.background_tasks = []

    initialize_state(app.state)

    try:
        yield
    except asyncio.CancelledError:
        logger.warning("Application shutdown interrupted by CancelledError.")
    finally:
        logger.info("FastAPI application shutdown event triggered.")

        for task in app.state.background_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info("Background task cancelled successfully.")

        for consumer in app.state.kafka_consumers.values():
            consumer.close()
        logger.info("Kafka consumers closed.")

app = FastAPI(lifespan=lifespan)

app.include_router(client_router)

@app.get("/health")
async def health_check():
    return {"status": "Consumer is running"}

