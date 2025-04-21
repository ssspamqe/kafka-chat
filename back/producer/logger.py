import logging 
logger = logging.getLogger("app_logger")
logger.setLevel(logging.DEBUG) 
handler = logging.StreamaHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)