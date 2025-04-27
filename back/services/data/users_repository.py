from pydantic import BaseModel

class UsersRepository:    
    def __init__(self, db):
        self.collection = db["users"]
    
    def find_by_username(self, username: str):
        user = self.collection.find_one({"user": username})
        return user if user else None

    def addChatSubscription(self, username: str, chat: str):
        user = self.collection.find_one({"user": username})
        if user:
            if chat not in user.get("chats", []):
                self.collection.update_one(
                    {"user": username},
                    {"$push": {"chats": chat}}
                )
                return True
        return False

class User(BaseModel):
    username: str
    chats: list[str]
    tag:str