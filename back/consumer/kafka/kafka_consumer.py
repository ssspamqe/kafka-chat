from confluent_kafka import Consumer, KafkaException
from back.consumer.config import config
from back.consumer.config.logger_config import logger

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

logger.debug("Kafka consumer configuration: %s", conf)

def create_consumer(base_conf, user_topic):
    logger.info(f"Creating consumer for topic {user_topic}...")
    temp_conf = base_conf.copy()
    temp_conf['group.id'] = user_topic
    consumer = Consumer(temp_conf)
    logger.info(f"Consumer for topic {user_topic} created successfully.")
    logger.info("Kafka consumer created successfully.")
    return consumer

def subscribe_to_topic(consumer, topic):
    consumer.subscribe([topic])

def close_consumer(consumer):
    consumer.close()

async def consume_messages(consumer, websocket):
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    logger.info(f"End of partition reached: {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
                else:
                    logger.info(f"Error occured: {msg.error()}")
                continue
            else:
                message = msg.value().decode('utf-8')
                logger.info(f"Received message from topic {msg.topic()}: {message}")
                await websocket.send_text(message)
                
    except KeyboardInterrupt:
        logger.info("Consumer interrupted by user.")
