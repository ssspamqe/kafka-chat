import { config } from "../config";

class ApiService {
  constructor() {
    this.producerSocket = null;
    this.consumerSocket = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.availableTags = [];
  }

  async connectToConsumer(endpoint) {
    return new Promise((resolve, reject) => {
      if (this.consumerSocket) {
        this.consumerSocket.close();
      }

      const socket = new WebSocket(
        `ws://${config.CONSUMER_SERVICE_HOST}${endpoint}`
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
  async fetchTags() {
    try {
      const response = await this.sendRequest("/tags", {}, "GET", "MONGO");
      this.availableTags = response.tags || [];
      return this.availableTags;
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  }
  async createTag(tagData) {
    try {
      const response = await this.sendRequest(
        "/tags",
        tagData,
        "POST",
        "MONGO"
      );

      this.availableTags = [...this.availableTags, response];
      return response;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  }
  async updateUserTag(username, tag) {
    try {
      return await this.sendRequest(
        `/users/${username}/tags`,
        { tag },
        "POST",
        "MONGO"
      );
    } catch (error) {
      console.error("Failed to update user tag:", error);
      throw error;
    }
  }

  async getUserTags(username) {
    try {
      return await this.sendRequest(
        `/users/${username}/tags`,
        {},
        "GET",
        "MONGO"
      );
    } catch (error) {
      console.error("Failed to get user tags:", error);
      return { current_tag: null, available_tags: [] };
    }
  }

  async sendRequest(endpoint, data, method, serviceType) {
    endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const ports = {
      MONGO: config.MONGODB_PORT,
      PRODUCER: config.PRODUCER_HOST,
      CONSUMER: config.CONSUMER_HOST,
    };

    const hostsMap = {
      MONGO: config.MONGO_SERVICE_HOST,
      PRODUCER: config.PRODUCER_SERVICE_HOST,
      CONSUMER: config.CONSUMER_SERVICE_HOST
    }

    const baseUrl = `http://${hostsMap[serviceType]}`;
    //const baseUrl = `http://${config.SERVICE_HOST}:${ports[serviceType]}`;
    const url = `${baseUrl}${endpoint}`;

    console.log("Making request to:", url);
    console.log("Request body:", data, method, serviceType);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
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
