import { USE_MOCK_API } from "../config";
import { mockApiService } from "./mockApiService";

class ApiService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseUrl = "ws://localhost:8000";
  }

  offMessage(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  connect(endpoint) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.socket.onerror = (error) => {
        reject(error);
      };

      this.socket.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(endpoint);
          }, 1000 * this.reconnectAttempts);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.messageCallbacks.forEach((cb) => cb(message));
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };
    });
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
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
    this.socket?.close();
    this.messageCallbacks = [];
  }
}

// export const apiService = new ApiService();

export const apiService = USE_MOCK_API ? mockApiService : new ApiService();
