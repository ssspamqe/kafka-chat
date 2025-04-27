from fastapi import FastAPI
from pymongo import MongoClient

app = FastAPI()
client = MongoClient("mongodb://root:example@mongodb:27017/")
db = client["chat_db"]

@app.post("/messages")
async def create_message(chat: str, sender: str, text: str, tag: str):
    db.messages.insert_one({
        "chat": chat,
        "sender": sender,
        "text": text,
        "tag": tag,
        "timestamp": datetime.now()
    })
    return {"status": "ok"}

@app.get("/messages/{chat}")
async def get_messages(chat: str):
    messages = list(db.messages.find({"chat": chat}, {"_id": 0}))
    return {"messages": messages}