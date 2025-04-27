from fastapi import FastAPI
from pymongo import MongoClient
from models.mongo_models import ChatMessage
from data.mongo_migration import do_migrations
from config.logger_config import logger
import asyncio
from contextlib import asynccontextmanager
from data.users_repository import UsersRepository
from pydantic import BaseModel
from config.config import Variables
import requests
from fastapi.openapi.utils import get_openapi


client = None
db = None
users_repository = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, users_repository
    
    client = MongoClient(Variables.MONGO_CONNECTION_STRING)
    db = client[Variables.MONGO_DB]
    
    logger.info("Running migrations on startup...")
    
    do_migrations(
        db,
        collections=["users", "messages", "chats"]
    )
    logger.info("Migrations completed.")

    users_repository = UsersRepository(db)

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
        logger.info("Service is closed")

app = FastAPI(lifespan=lifespan)


@app.post("/messages")
async def create_message(message:ChatMessage):
    return {
        "status": "not implemented"
    }
    # mongo_service.save_message
    # db.messages.insert_one({
    #     "chat": chat,
    #     "sender": sender,
    #     "text": text,
    #     "tag": tag,
    #     "timestamp": datetime.now()
    # })
    # return {"status": "ok"}

@app.get("/messages/{chat}")
async def get_messages(chat: str):
    return {"status": "not implemented"}

@app.get("/user/{username}")
async def get_user(username:str):
    user = users_repository.find_by_username(username)
    return user

@app.post("/user/{username}")
async def create_user(username:str):
    if users_repository.save_user_with_username(username):
        return {"status": "ok"}
    else:
        return {"status": "user already exists"}

class CreateSubscriptionRequest(BaseModel):
    chat: str
    username: str

@app.post("/subscription")
async def create_subscription(request: CreateSubscriptionRequest):
    users_repository.add_chat_subscription(request.username, request.chat)
    url = f"http://{Variables.PRODUCER_HOST}/subscribing/{request.username}"
    params = {"chat": request.chat}
    requests.get(url, params=params)
    return {"status": "ok"}

@app.get("/openapi.json", include_in_schema=False)
def get_open_api_schema():
    return get_openapi(
        title="Kafka Chat Services API",
        version="1.0.0",
        description="API documentation for Kafka Chat Services",
        routes=app.routes,
    )