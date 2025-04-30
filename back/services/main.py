from fastapi import FastAPI
from pymongo import MongoClient
from data.mongo_migration import do_migrations
from config.logger_config import logger
import asyncio
from contextlib import asynccontextmanager
from data.users_repository import UsersRepository
from data.messages_repository import MessagesRepository
from pydantic import BaseModel, Field
from config.config import Variables
import requests
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

client = None
db = None
users_repository = None
messages_repository = None


class ChatMessage(BaseModel):
    chat: str
    text: str
    tag: Optional[str]
    sender: str
    timestamp: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure messages_repository is included
    global client, db, users_repository, messages_repository

    client = MongoClient(Variables.MONGO_CONNECTION_STRING)
    db = client[Variables.MONGO_DB]

    logger.info("Running migrations on startup...")

    do_migrations(
        db,
        collections=["users", "messages", "chats"]
    )
    logger.info("Migrations completed.")

    users_repository = UsersRepository(db)
    messages_repository = MessagesRepository(db)  # Ensure this is initialized

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.get("/user/{username}")
async def get_user(username: str):
    user = users_repository.find_by_username(username)
    return user


class CreateUserRequest(BaseModel):
    tag: Optional[str] = Field(None, description="Optional user tag")


@app.post("/user/{username}")
async def create_user(username: str, request: CreateUserRequest):
    if users_repository.save_user_with_username(username, request.tag):
        user_data = {
            "username": username,
            "tag": request.tag,
            "chats": ["global"]
        }
    else:
        users_repository.save_tag(username, request.tag)
        user_data = {
            "username": username,
            "tag": request.tag,
            "chats": users_repository.get_user_chats(username) or ["global"]
        }

    return {
        "status": "ok",
        "user": user_data
    }


class UpdateTagRequest(BaseModel):
    tag: Optional[str]


@app.post("/tag/{username}")
async def update_tag(username: str, request: UpdateTagRequest):
    if users_repository.save_tag(username, request.tag):
        return {"status": "ok"}
    else:
        return {"status": "user not found"}


@app.get("/tag/{username}")
async def get_tag(username: str):
    tag = users_repository.get_tag(username)
    if tag:
        return {"tag": tag}
    else:
        return {"status": "user not found"}


class CreateSubscriptionRequest(BaseModel):
    chat: str
    username: str


@app.post("/subscription")
async def create_subscription(request: CreateSubscriptionRequest):
    users_repository.add_chat_subscription(request.username, request.chat)
    return {"status": "ok"}

@app.get("/messages/{chat}/{tag}")
async def get_messages(chat: str, tag: str):
    messages = messages_repository.get_messages(chat, tag)
    if messages:
        return {"messages": messages}
    else:
        return {"status": "no messages found"}


@app.get("/messages/{chat}")
async def get_messages_without_tag(chat: str):
    messages = messages_repository.get_messages(chat, None)
    if messages:
        return {"messages": messages}
    else:
        return {"status": "no messages found"}


@app.post("/message")
async def create_message(message: ChatMessage):
    message_data = {
        "chat": message.chat,
        "sender": message.sender,
        "text": message.text,
        "tag": message.tag,
        "timestamp": message.timestamp
    }
    messages_repository.save_message(message_data)
    return {"status": "ok"}


@app.get("/openapi.json", include_in_schema=False)
def get_open_api_schema():
    return get_openapi(
        title="Kafka Chat Services API",
        version="1.0.0",
        description="API documentation for Kafka Chat Services",
        routes=app.routes,
    )
