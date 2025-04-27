from pymongo import MongoClient
def do_migrations(db, collections:list):
    for collection_name in collections:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
            print(f"Collection '{collection_name}' created.")
        else:
            print(f"Collection '{collection_name}' already exists.")
