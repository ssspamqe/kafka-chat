import socket
class Variables:
    MONGO_DB = "chat_app_db"
    
    MONGO_CONNECTION_STRING = "mongodb://mongodb:27017"
    MONGO_DB = "kafka_chat_db"
    
    # PRODUCER_HOST = "producer:8000"
    # CONSUMER_HOST = "consumer:8001"
    MONGO_MESSAGES_COLLECTION = "messages"
    
    service_host = socket.gethostname()
    print(f"currend host: ${service_host}")
    MONGO_SERVICE_HOST = service_host + '/api/mongo_service'
    PRODUCER_HOST = service_host + '/api/producer_service'
    CONSUMER_HOST =  service_host + '/api/consumer_service'