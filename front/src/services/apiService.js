import { config } from "../config";

class ApiService {
  constructor() {
    this.producerSocket = null;
    this.consumerSocket = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connectToConsumer(endpoint) {
    return new Promise((resolve, reject) => {
      if (this.consumerSocket) {
        this.consumerSocket.close();
      }

      const socket = new WebSocket(
        `ws://${config.SERVICE_HOST}:${config.CONSUMER_HOST}${endpoint}`
      );

      socket.onopen = () => {
        console.log(`WebSocket connected to ${endpoint}`);
        this.consumerSocket = socket;
        this.reconnectAttempts = 0;
        resolve();
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.messageCallbacks.forEach((cb) => cb(message));
        } catch (error) {
          console.error("Message parsing error:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      socket.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
            this.connectToConsumer(endpoint);
          }, 1000 * this.reconnectAttempts);
        }
      };
    });
  }

  async sendRequest(
    endpoint,
    data = {},
    method = "POST",
    serviceType = "MONGO"
  ) {
    endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const ports = {
      MONGO: config.MONGODB_PORT,
      PRODUCER: config.PRODUCER_HOST,
      CONSUMER: config.CONSUMER_HOST,
    };

    const baseUrl = `http://${config.SERVICE_HOST}:${ports[serviceType]}`;
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request to ${url} failed:`, error);
      throw error;
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  disconnect() {
    this.producerSocket?.close();
    this.consumerSocket?.close();
    this.messageCallbacks = [];
  }
}

export const apiService = new ApiService();
