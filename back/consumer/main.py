from fastapi import FastAPI
from custom_websockets.endpoints.send_client_message import router as client_router
from custom_websockets.endpoints.subscribe_topic import router as subscribe_router 
from custom_websockets.endpoints.send_client_message import initialize_state as client_init_state
from custom_websockets.endpoints.subscribe_topic import initialize_state as subscribe_init_state
import asyncio
from contextlib import asynccontextmanager
from config.logger_config import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI application startup event triggered.")
    logger.info("Creating temporary state for FastAPI application.")

    client_init_state(app.state)
    subscribe_init_state(app.state)

    app.state.consumers = {}
    app.state.tags = {}

    try:
        yield
    except asyncio.CancelledError:
        logger.warning("Application shutdown interrupted by CancelledError.")
    finally:
        logger.info("FastAPI application shutdown event triggered.")

app = FastAPI(lifespan=lifespan)

app.include_router(client_router)
app.include_router(subscribe_router)

@app.get("/health")
async def health_check():
    return {"status": "Consumer is running"}

