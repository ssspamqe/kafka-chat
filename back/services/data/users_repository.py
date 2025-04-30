from bson import ObjectId  # Import ObjectId to handle MongoDB IDs
from pydantic import BaseModel

class UsersRepository:    
    def __init__(self, db):
        self.collection = db["users"]
    
    def find_by_username(self, username: str):
        user = self.collection.find_one({"username": username})
        if user:
            user["_id"] = str(user["_id"])  # Convert ObjectId to string
        return user if user else None

    def add_chat_subscription(self, username: str, chat: str):
        user = self.collection.find_one({"username": username})
        if user:
            if chat not in user.get("chats", []):
                self.collection.update_one(
                    {"username": username},
                    {"$push": {"chats": chat}}
                )
                return True
        return False

    def save_user_with_username(self, username: str, tag: str = None):
        user = self.collection.find_one({"username": username})
        if not user:
            self.collection.insert_one({"username": username, "chats": ['global'], "tag": tag})
            return True
        return False
    
    def save_tag(self, username: str, tag: str):
        user = self.collection.find_one({"username": username})
        if user:
            self.collection.update_one(
                {"username": username},
                {"$set": {"tag": tag}}
            )
            return True
        return False

    def get_tag(self, username: str):
        user = self.collection.find_one({"username": username})
        if user:
            return user.get("tag")
        return None
    
    def get_user_chats(self, username: str):
        user = self.collection.find_one({"username": username})
        if user:
            return user.get("chats")
        return None

class User(BaseModel):
    username: str
    chats: list[str]
    tag: str

    class Config:
        orm_mode = True