from fastapi import FastAPI
from pymongo import MongoClient
from models.mongo_models import ChatMessage
from mongo_service import MongoService
from data.mongo_migration import do_migrations
from config import logger
import asyncio
from contextlib import asynccontextmanager
from data.users_repository import UsersRepository
from pydantic import BaseModel

app = FastAPI()

client = None
db = None
users_repository = None

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

@app.post("/subscription")
async def create_subscription(request: CreateSubscriptionRequest):
    users_repository.add_chat_subscription(request.username, request.chat)
    return {"status": "ok"}


class CreateSubscriptionRequest(BaseModel):
    chat: str
    username: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = MongoClient("mongodb://mongodb:27017")
    db = client["kafka_chat_db"]
    
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
        logger.info("Kafka consumers closed.")

app = FastAPI(lifespan=lifespan)