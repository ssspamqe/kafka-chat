class Variables:
    KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
    KAFKA_GLOBAL_TOPIC = "kafka.chat.global"
    KAFKA_CHAT_TOPIC_PREFIX = "kafka.chat.room"
    KAFKA_OFFSET_RESET = "earliest"
    KAFKA_CONSUMER_GROUP = "my_consumer_group"

KAFKA_CONFIG = {
    'bootstrap.servers': Variables.KAFKA_BOOTSTRAP_SERVERS,
    'group.id': Variables.KAFKA_CONSUMER_GROUP,
    'auto.offset.reset': Variables.KAFKA_OFFSET_RESET
}
