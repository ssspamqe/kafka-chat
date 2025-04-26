import { apiService } from "./apiService";

class MessageService {
  constructor() {
    this.subscribers = new Set();
  }

  async connectToGlobalChat() {
    console.log("Connecting to global chat consumer...");
    await apiService.connectToConsumer('/send-message/client/global');
    apiService.onMessage((message) => {
      console.log("Global chat message:", message);
      this.handleMessage(message);
    });
  }
  
  async connectToRoom(roomId) {
    console.log(`Connecting to room ${roomId} consumer...`);
    await apiService.connectToConsumer(`/send-message/client/${roomId}`);
    apiService.onMessage((message) => {
      console.log(`Room ${roomId} message:`, message);
      this.handleMessage(message);
    });
  }

async loadRoomMessages(roomId) {
  try {
    const response = await fetch(`/api/messages/${roomId || 'global'}`);
    return await response.json();
  } catch {
    return [
      {
        text: "Welcome to the chat!",
        sender: "System",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

  sendGlobalMessage({ text, sender, tag = "general" }) {
    apiService.connectToProducer('/send-message/global')
      .then(() => {
        apiService.send({
          type: "MESSAGE",
          sender,
          text,
          tag,
          timestamp: new Date().toISOString()
        });
      });
  }

  sendRoomMessage(roomId, { text, sender, tag = "general" }) {
    apiService.connectToProducer(`/send-message/chat/${roomId}`)
      .then(() => {
        apiService.send({
          type: "MESSAGE",
          chat: roomId,
          sender,
          text,
          tag,
          timestamp: new Date().toISOString()
        });
      });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  formatIncomingMessage(rawMessage) {
    return {
      text: rawMessage.text,
      sender: rawMessage.sender,
      timestamp: rawMessage.timestamp || new Date().toISOString()
    };
  }

  handleMessage(rawMessage) {
    const message = this.formatIncomingMessage(rawMessage);
    this.subscribers.forEach(callback => callback(message));
  }

  disconnect() {
    apiService.disconnect();
    this.subscribers.clear();
  }
}

export const messageService = new MessageService();