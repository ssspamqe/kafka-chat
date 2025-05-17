const isLocal = window.location.hostname === 'localhost';
const serviceHost = isLocal ? 'localhost' : window.location.hostname;
const wsProtocol = isLocal ? 'ws://' : 'ws://';

export const config = {
    SERVICE_HOST: isLocal ? `${serviceHost}` : `${serviceHost}`,
    WS_PROTOCOL: wsProtocol,
    MONGODB_PORT: isLocal ? 8002 : '',
    KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    PRODUCER_HOST: isLocal ? 8000 : '',
    CONSUMER_HOST: isLocal ? 8001 : ''
};