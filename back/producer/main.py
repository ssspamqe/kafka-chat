from fastapi import FastAPI
from custom_websockets.endpoints.send_chat_message import router as chat_router
from custom_websockets.endpoints.send_global_message import router as global_router

app = FastAPI()

app.include_router(chat_router)
app.include_router(global_router)