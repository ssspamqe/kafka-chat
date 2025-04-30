import logging 
logger = logging.getLogger("kafka_chat_logger")
logger.setLevel(logging.DEBUG) 
handler = logging.StreamHandler()
formatter = logging.Formatter("%(levelname)s:\t%(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)