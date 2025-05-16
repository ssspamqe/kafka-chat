const isLocal = window.location.hostname === 'localhost';
const serviceHost = isLocal ? 'localhost' : window.location.hostname;
const wsProtocol = isLocal ? 'ws://' : 'wss://';

export const config = {
    SERVICE_HOST: serviceHost,
    WS_PROTOCOL: wsProtocol,
    MONGODB_PORT: isLocal ? 8002 : 80,
    KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    PRODUCER_HOST: isLocal ? 8000 : 80,
    CONSUMER_HOST: isLocal ? 8001 : 80
};