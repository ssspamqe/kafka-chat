const serviceHost = window.location.hostname === 'localhost' ? 'localhost' : 'mongo-service';
export const config = {
    SERVICE_HOST: serviceHost,
    MONGODB_PORT: 8002,
    KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    PRODUCER_HOST: 8000,
    CONSUMER_HOST: 8001
};