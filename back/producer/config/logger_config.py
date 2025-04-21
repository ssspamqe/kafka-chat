import logging 
logger = logging.getLogger("kafka_chat_logger")
logger.setLevel(logging.DEBUG) 
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)