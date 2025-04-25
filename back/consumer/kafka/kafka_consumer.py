from confluent_kafka import Consumer, KafkaException
from config.config import KAFKA_CONFIG as conf
from config.logger_config import logger

logger.debug("Kafka consumer configuration: %s", conf)

def create_consumer(consumers, base_conf, user_topic):
    logger.info(f"Creating consumer for topic {user_topic}...")
    temp_conf = base_conf.copy()
    consumer = Consumer(temp_conf)
    subscribe_to_topic(consumer, user_topic)
    logger.info(f"Consumer for topic {user_topic} created successfully.")
    logger.info("Kafka consumer created successfully.")
    consumers[user_topic] = consumer
    logger.info(f"Consumer for topic {user_topic} added to consumers dictionary.")
    return consumer

def subscribe_to_topic(consumer, topic):
    logger.info(f"Subscribing to topic {topic}...")
    consumer.subscribe([topic])

def get_consumer(consumers, base_conf, user_topic):
    logger.info(f"Getting consumer for topic {user_topic}...")
    if user_topic not in consumers:
        logger.info(f"Consumer for topic {user_topic} not found, creating a new one...")
        consumer = create_consumer(consumers, base_conf, user_topic)
        consumers[user_topic] = consumer
    else:
        consumer = consumers[user_topic]
    return consumer

def close_consumer(consumer):
    logger.info("Closing consumer...")
    consumer.close()

async def consume_messages(consumer):
    try:
        msg = consumer.poll(1.0)
        if msg is None:
            return None
        if msg.error():
            if msg.error().code() == KafkaException._PARTITION_EOF:
                logger.info(f"End of partition reached: {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
            else:
                logger.info(f"Error occured: {msg.error()}")
            return None
        else:
            message = msg.value().decode('utf-8')
            logger.info(f"Received message from topic {msg.topic()}: {message}")
            return message
                
    except KeyboardInterrupt:
        logger.info("Consumer interrupted by user.")
