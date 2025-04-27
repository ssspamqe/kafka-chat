from fastapi import FastAPI
from custom_websockets.endpoints.send_client_message import router as client_router
from custom_websockets.endpoints.send_client_message import initialize_state
import asyncio
from contextlib import asynccontextmanager
from config.logger_config import logger
from custom_kafka.kafka_consumer import create_consumer
from collections import defaultdict

state = None

def get_state():
    return state

def initialize_state(app_state):
    global state
    state = app_state
    
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI application startup event triggered.")
    logger.info("Creating temporary state for FastAPI application.")

    initialize_state(app.state)

    state.consumer = await create_consumer()

    state.subscriptions = defaultdict(list)

    try:
        yield
    except asyncio.CancelledError:
        logger.warning("Application shutdown interrupted by CancelledError.")
    finally:
        logger.info("FastAPI application shutdown event triggered.")

app = FastAPI(lifespan=lifespan)

app.include_router(client_router)

@app.get("/health")
async def health_check():
    return {"status": "Consumer is running"}

