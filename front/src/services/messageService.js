import { apiService } from "./apiService";
import { config } from "../config";

class MessageService {
  constructor() {
    this.subscribers = new Set();
    this.currentRoom = null;
    this.username = null;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  async connect(username, room = "global") {
    try {
      if (
        this.socket &&
        this.username === username &&
        this.currentRoom === room
      ) {
        return;
      }

      this.disconnect();

      await apiService.sendRequest(
        "/subscription",
        { chat: room, username },
        "POST"
      );

      await this._setupWebSocket(username);
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  }

  async _setupWebSocket(username) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(
        `ws://${config.SERVICE_HOST}:${config.CONSUMER_HOST}/receive-messages/user/${username}`
      );

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.subscribers.forEach((cb) => cb(message));
        } catch (error) {
          console.error("Message parsing error:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.socket.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
            this._setupWebSocket(this.username);
          }, 1000 * this.reconnectAttempts);
        }
      };
    });
  }

  async sendMessage(roomId, message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to chat");
    }

    try {
      return await apiService.sendRequest(
        `/send-message/chat/${roomId}`,
        {
          text: message.text,
          sender: message.sender,
          tag: message.tag || null,
          timestamp: new Date().toISOString(),
        },
        "POST",
        "PRODUCER"
      );
    } catch (error) {
      console.error("Message sending failed:", error);
      throw error;
    }
  }

  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.subscribers.clear();
    this.username = null;
    this.currentRoom = null;
  }
}

export const messageService = new MessageService();
