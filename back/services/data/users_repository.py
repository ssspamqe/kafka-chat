from bson import ObjectId
from pydantic import BaseModel
from prometheus_client import Counter, Histogram
import time

MONGO_USER_OPS = Counter(
    'mongo_user_operations_total',
    'User collection operations',
    ['operation']
)

MONGO_USER_LATENCY = Histogram(
    'mongo_user_latency_seconds',
    'User operation latency',
    ['operation']
)

class UsersRepository:    
    def __init__(self, db):
        self.collection = db["users"]
    
    def find_by_username(self, username: str):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if user:
                user["_id"] = str(user["_id"])
            MONGO_USER_OPS.labels(operation='find').inc()
            return user if user else None
        finally:
            MONGO_USER_LATENCY.labels(operation='find').observe(time.time() - start_time)

    def add_chat_subscription(self, username: str, chat: str):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if user:
                if chat not in user.get("chats", []):
                    self.collection.update_one(
                        {"username": username},
                        {"$push": {"chats": chat}}
                    )
                    MONGO_USER_OPS.labels(operation='update').inc()
                    return True
            return False
        finally:
            MONGO_USER_LATENCY.labels(operation='update').observe(time.time() - start_time)

    def save_user_with_username(self, username: str, tag: str = None):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if not user:
                self.collection.insert_one({"username": username, "chats": ['global'], "tag": tag})
                MONGO_USER_OPS.labels(operation='insert').inc()
                return True
            return False
        finally:
            MONGO_USER_LATENCY.labels(operation='insert').observe(time.time() - start_time)
    
    def save_tag(self, username: str, tag: str):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if user:
                self.collection.update_one(
                    {"username": username},
                    {"$set": {"tag": tag}}
                )
                MONGO_USER_OPS.labels(operation='update').inc()
                return True
            return False
        finally:
            MONGO_USER_LATENCY.labels(operation='update').observe(time.time() - start_time)


    def get_tag(self, username: str):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if user:
                return user.get("tag")
            return None
        finally:
            MONGO_USER_LATENCY.labels(operation='find').observe(time.time() - start_time)
    
    def get_user_chats(self, username: str):
        start_time = time.time()
        try:
            user = self.collection.find_one({"username": username})
            if user:
                MONGO_USER_OPS.labels(operation='find').inc()
                return user.get("chats")
            return None
        finally:
            MONGO_USER_LATENCY.labels(operation='find').observe(time.time() - start_time)

class User(BaseModel):
    username: str
    chats: list[str]
    tag: str

    class Config:
        orm_mode = True