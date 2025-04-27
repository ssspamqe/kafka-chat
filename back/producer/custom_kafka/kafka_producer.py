import json
from confluent_kafka import Producer
from config import config
from config.logger_config import logger
from confluent_kafka.admin import AdminClient, NewTopic

class Message:
    def __init__(self, sender: str, text: str, tag:str):
        self.sender = sender
        self.text = text
        self.tag = tag

producer_config = {
    'bootstrap.servers': config.Variables.KAFKA_BOOTSTRAP_SERVERS
}
logger.info("Creating producer...")
producer = Producer(producer_config)

# Serialize the Message object to JSON before sending it to Kafka
def send_message_to_global(message: Message):
    topic_name = config.Variables.KAFKA_GLOBAL_TOPIC
    serialized_message = json.dumps(message.__dict__).encode('utf-8')

    logger.info(f"Sending global message to topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, serialized_message)

    producer.flush()

def send_message_to_chat(chat, message: Message):
    topic_name = f'{config.Variables.KAFKA_CHAT_TOPIC_PREFIX}.{chat}'
    create_kafka_topic_if_not_exists(f"kafka.chat.{chat}")
    serialized_message = json.dumps(message.__dict__).encode('utf-8')

    logger.info(f"Sending message to chat {chat} in topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
    producer.produce(topic_name, serialized_message)

    producer.flush()


def create_kafka_topic_if_not_exists(topic_name: str):
    admin_client = AdminClient({"bootstrap.servers": config.Variables.KAFKA_BOOTSTRAP_SERVERS})
    existing_topics = admin_client.list_topics(timeout=10).topics

    if topic_name not in existing_topics:
        logger.info(f"Topic '{topic_name}' does not exist. Creating it...")
        new_topic = NewTopic(topic_name, num_partitions=1, replication_factor=1)
        admin_client.create_topics([new_topic])
        logger.info(f"Topic '{topic_name}' created successfully.")
    else:
        logger.info(f"Topic '{topic_name}' already exists.")