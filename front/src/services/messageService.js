import { apiService } from "./apiService";
import { config } from "../config";

class MessageService {
  constructor() {
    this.messageSubscribers = new Set();
    this.roomSubscriptions = new Set(['global']); 
    this.username = null;
    this.consumerSocket = null;
    this.producerSockets = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.pendingMessages = new Map();
  }

  async connect(username) {
    if (this.consumerSocket && this.username === username) {
      return;
    }

    this.disconnect();
    this.username = username;

    try {
      await this._setupConsumerSocket();
      await this.subscribeToRoom('global');
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  }

  async _setupConsumerSocket() {
    return new Promise((resolve, reject) => {      
      const wsUrl = `${config.CONSUMER_SERVICE_HOST}/receive-messages/user/${this.username}`;
      console.log('Connecting to WebSocket:', wsUrl);
      this.consumerSocket = new WebSocket(wsUrl);

      this.consumerSocket.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.consumerSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.sender === this.username) return;
          console.log("Received message:", message);
          
          if (!this.roomSubscriptions.has(message.chat)) {
            if (!this.pendingMessages.has(message.chat)) {
              this.pendingMessages.set(message.chat, []);
            }
            this.pendingMessages.get(message.chat).push(message);
            return;
          }

          this._notifySubscribers(message);
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
            this._setupConsumerSocket();
          }, 1000 * this.reconnectAttempts);
        }
      };
    });
  }

  async subscribeToRoom(roomId) {
    if (!this.username || this.roomSubscriptions.has(roomId)) {
      this._flushPendingMessages(roomId);
      return;
    }

    try {
      await apiService.sendRequest(
        `/subscribing/${this.username}/${roomId}`,
        {},
        "POST",
        "CONSUMER"
      );

      this.roomSubscriptions.add(roomId);
      this._flushPendingMessages(roomId);
    } catch (error) {
      console.error("Failed to subscribe to room:", error);
      throw error;
    }
  }

  _flushPendingMessages(roomId) {
    if (this.pendingMessages.has(roomId)) {
      const messages = this.pendingMessages.get(roomId);
      messages.forEach(msg => this._notifySubscribers(msg));
      this.pendingMessages.delete(roomId);
    }
  }

  _notifySubscribers(message) {
    this.messageSubscribers.forEach(cb => cb(message));
  }

  async sendMessage(roomId, message) {
    if (!this.username) throw new Error("Not authenticated");

    try {      
      if (!this.producerSockets.has(roomId)) {
        
        const wsUrl = `ws://${config.PRODUCER_SERVICE_HOST}/send-message/chat/${roomId}`;
        //const wsUrl = `${config.WS_PROTOCOL}${config.SERVICE_HOST}/ws/producer/send-message/chat/${roomId}`;
        console.log('Connecting to producer WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);

        await new Promise((resolve, reject) => {
          socket.onopen = resolve;
          socket.onerror = reject;
        });

        this.producerSockets.set(roomId, socket);
      }

      const socket = this.producerSockets.get(roomId);
      socket.send(JSON.stringify({
        ...message,
        chat: roomId
      }));
    } catch (error) {
      console.error("Message sending failed:", error);
      this.producerSockets.delete(roomId);
      throw error;
    }
  }

  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    this.messageSubscribers.add(callback);
    return () => this.messageSubscribers.delete(callback);
  }

  isSubscribed(roomId) {
    return this.roomSubscriptions.has(roomId);
  }

  disconnect() {
    if (this.consumerSocket) {
      this.consumerSocket.close();
      this.consumerSocket = null;
    }
    
    this.producerSockets.forEach(socket => socket.close());
    this.producerSockets.clear();
    
    this.messageSubscribers.clear();
    this.pendingMessages.clear();
    this.username = null;
    this.roomSubscriptions.clear();
    this.roomSubscriptions.add('global');
  }
}

export const messageService = new MessageService();