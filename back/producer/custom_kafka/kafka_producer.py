from prometheus_client import Counter, Histogram
import time
import json
from confluent_kafka import Producer
from config import config
from config.logger_config import logger
from confluent_kafka.admin import AdminClient, NewTopic

MESSAGES_SENT = Counter(
    'kafka_messages_produced_total',
    'Total messages sent to Kafka',
    ['topic']
)

PRODUCE_LATENCY = Histogram(
    'kafka_produce_latency_seconds',
    'Latency of Kafka produce operations',
    ['topic'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

PRODUCE_ERRORS = Counter(
    'kafka_produce_errors_total',
    'Total Kafka produce errors',
    ['error_type']
)

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

def send_message_to_chat(chat, message: Message):
    topic_name = f'{config.Variables.KAFKA_CHAT_TOPIC_PREFIX}.{chat}'
    create_kafka_topic_if_not_exists(f"kafka.chat.{chat}")
    serialized_message = json.dumps(message.__dict__).encode('utf-8')

    try:
        start_time = time.time()
        logger.info(f"Sending message to chat {chat} in topic {topic_name}: {message.sender} - {message.text}, tag: {message.tag}")
        producer.produce(topic_name, serialized_message)

        producer.flush()

        MESSAGES_SENT.labels(topic=topic_name).inc()
        PRODUCE_LATENCY.labels(topic=topic_name).observe(time.time() - start_time)
        
    except KafkaException as e:
        PRODUCE_ERRORS.labels(error_type=str(e.code())).inc()
        logger.error(f"Failed to send message: {str(e)}")
        raise
    except Exception as e:
        PRODUCE_ERRORS.labels(error_type=type(e).__name__).inc()
        logger.error(f"Unexpected error: {str(e)}")
        raise


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