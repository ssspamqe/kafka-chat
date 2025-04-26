from confluent_kafka import Consumer, KafkaError
from config.config import KAFKA_CONFIG as conf
from config.logger_config import logger

logger.debug("Kafka consumer configuration: %s", conf)

def create_consumer(consumers, base_conf, user_topic):
    logger.info(f"Creating consumer for topic {user_topic}...")
    temp_conf = base_conf.copy()
    consumer = Consumer(temp_conf)
    subscribe_to_topic(consumer, user_topic)
    logger.info("Kafka consumer created successfully.")
    consumers[user_topic] = consumer
    logger.info(f"Consumer for topic {user_topic} added to consumers dictionary.")
    return consumer

def subscribe_to_topic(consumer, topic):
    logger.info(f"Subscribing to topic {topic}...")
    consumer.subscribe([topic])
    logger.info(f"Subscribed to topic {topic} successfully.")

def get_consumer(consumers, base_conf, user_topic):
    logger.info(f"Getting consumer for topic {user_topic}...")
    if user_topic not in consumers:
        logger.info(f"Consumer for topic {user_topic} not found, creating a new one...")
        if "kafka.chat.room.global" not in consumers:
            logger.info("Consumer for 'kafka.chat.room.global' not found, creating it...")
            global_consumer = create_consumer(consumers, base_conf, "kafka.chat.room.global")
            consumers["kafka.chat.room.global"] = global_consumer
        else:
            global_consumer = consumers["kafka.chat.room.global"]

        subscribe_to_topic(global_consumer, user_topic)
        consumers[user_topic] = global_consumer
    else:
        consumer = consumers[user_topic]
    return consumers[user_topic]

def close_consumer(consumer):
    logger.info("Closing consumer...")
    consumer.close()

async def consume_messages(consumer):
    try:
        msg = consumer.poll(1.0)
        if msg is None:
            return None
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                logger.info(f"End of partition reached: {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
            else:
                logger.info(f"Error occurred: {msg.error()}")
            return None
        else:
            message = msg.value().decode('utf-8')
            logger.info(f"Received message from topic {msg.topic()}: {message}")
            return message
                
    except KeyboardInterrupt:
        logger.info("Consumer interrupted by user.")
