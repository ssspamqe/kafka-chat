from fastapi import FastAPI
from custom_websockets.endpoints.send_chat_message import router as chat_router

app = FastAPI()

app.include_router(chat_router)
