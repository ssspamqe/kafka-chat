const isLocal = window.location.hostname === 'localhost';
const serviceHost = window.location.hostname;
const wsProtocol = 'ws://'

export const config = {
    SERVICE_HOST: isLocal ? `${serviceHost}` : `${serviceHost}`,
    WS_PROTOCOL: wsProtocol,
    MONGODB_PORT: isLocal ? 8002 : '',
    KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    PRODUCER_HOST: isLocal ? 8000 : '',
    CONSUMER_HOST: isLocal ? 8001 : '',

    MONGO_SERVICE_HOST: serviceHost + '/api/mongo_service',
    PRODUCER_SERVICE_HOST: serviceHost + '/api/producer_service',
    CONSUMER_SERVICE_HOST: serviceHost + '/api/consumer_service'
};