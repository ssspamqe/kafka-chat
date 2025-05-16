const serviceHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
export const config = {
    SERVICE_HOST: serviceHost,
    MONGODB_PORT: window.location.hostname === 'localhost' ? 8002 : 80,
    KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    PRODUCER_HOST: window.location.hostname === 'localhost' ? 8000 : 80,
    CONSUMER_HOST: window.location.hostname === 'localhost' ? 8001 : 80
};