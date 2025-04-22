from confluent_kafka import Consumer, KafkaException
from config import config
from config.logger_config import logger

class Message:
    def __init__(self, sender: str, text: str, tag:str):
        self.sender = sender
        self.text = text
        self.tag = tag

conf = {
    'bootstrap.servers': config.Variables.KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'my_consumer_group',
    'auto.offset.reset': config.Variables.KAFKA_OFFSET_RESET
}

def create_consumer(base_conf, user_topic):
    logger.info(f"Creating consumer for topic {user_topic}...")
    temp_conf = base_conf.copy()
    temp_conf['group.id'] = user_topic
    consumer = Consumer(temp_conf)
    logger.info(f"Consumer for topic {user_topic} created successfully.")
    return consumer

def subscribe_to_topic(consumer, topic):
    consumer.subscribe([topic])

def close_consumer(consumer):
    consumer.close()

def consume_messages(consumer):
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaException._PARTITION_EOF:
                print("Достигнут конец партиции")
            else:
                print(f"Ошибка: {msg.error()}")
            continue
    print("Запуск потребителя...")
