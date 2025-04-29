import { apiService } from "./apiService";
import { config } from "../config";

class MessageService {
  constructor() {
    this.subscribers = new Set();
    this.currentRooms = new Set(['global']); 
    this.username = null;
    this.consumerSocket = null;
    this.producerSocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }


  async connect(username) {
    try {
      if (
        this.consumerSocket &&
        this.username === username
      ) {
        return;
      }

      this.disconnect();

      this.username = username;

      await this._setupWebSocket();
      await this.subscribeToRoom('global');
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  }

  async _setupWebSocket() {
    return new Promise((resolve, reject) => {
      this.consumerSocket = new WebSocket(
        `ws://${config.SERVICE_HOST}:${config.CONSUMER_HOST}/receive-messages/user/${this.username}`
      );

      this.consumerSocket.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.consumerSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.subscribers.forEach((cb) => cb(message));
        } catch (error) {
          console.error("Message parsing error:", error);
        }
      };

      this.consumerSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.consumerSocket.onclose = () => {
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

  async subscribeToRoom(roomId) {
    if (!this.username || this.currentRooms.has(roomId)) return;

    try {
      await apiService.sendRequest(
        "/subscription",
        { chat: roomId, username: this.username },
        "POST"
      );
      this.currentRooms.add(roomId);
    } catch (error) {
      console.error("Failed to subscribe to room:", error);
      throw error;
    }
  }
  // async unsubscribeFromRoom(roomId) {
  //   if (!this.username || !this.currentRooms.has(roomId)) return;
  
  //   try {
  //     await apiService.sendRequest(
  //       "/unsubscribe",
  //       { chat: roomId, username: this.username },
  //       "POST"
  //     );
  //     this.currentRooms.delete(roomId);
  //   } catch (error) {
  //     console.error("Failed to unsubscribe from room:", error);
  //     throw error;
  //   }
  // }

  
  async sendMessage(roomId, message) {
    try {
      if (!this.producerSocket || this.producerSocket.readyState !== WebSocket.OPEN) {
        this.producerSocket = new WebSocket(
          `ws://${config.SERVICE_HOST}:${config.PRODUCER_HOST}/send-message/chat/${roomId}`
        );
  
        await new Promise((resolve, reject) => {
          this.producerSocket.onopen = resolve;
          this.producerSocket.onerror = reject;
        });
      }
  
      this.producerSocket.send(JSON.stringify({
        ...message,
        chat: roomId 
      }));
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
    if (this.consumerSocket) {
      this.consumerSocket.close();
      this.consumerSocket = null;
    }
    if (this.producerSocket) {
      this.producerSocket.close();
      this.producerSocket = null;
    }
    this.subscribers.clear();
    this.username = null;
    this.currentRoom = null;
  }
}

export const messageService = new MessageService();
