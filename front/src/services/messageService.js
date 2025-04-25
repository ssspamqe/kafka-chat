import { apiService } from "./apiService";

class MessageService {
  constructor() {
    this.subscribers = new Set();
    this.messageHandlers = new Map();
  }

  async connectToGlobalChat() {
    //await apiService.connect("/send-message/global");
    await apiService.connect();
    const handler = this.handleMessage.bind(this);
    this.messageHandlers.set("global", handler);
    apiService.onMessage(handler);

    const messages = await this.loadRoomMessages("global");
    messages.forEach((message) => this.handleMessage(message));
  }

  async connectToRoom(roomId) {
    await apiService.connect(`/send-message/chat/${roomId}`);
    const handler = this.handleMessage.bind(this);
    this.messageHandlers.set(roomId, handler);
    apiService.onMessage(handler);

    const messages = await this.loadRoomMessages(roomId);
    messages.forEach((message) => this.handleMessage(message));
  }

  async loadRoomMessages(roomId) {
    // const response = await fetch(`/api/rooms/${roomId}/messages`);
    // return response.ok ? await response.json() : [];
    return new Promise((resolve) => {
      setTimeout(() => {
        if (roomId === "general") {
          resolve([
            {
              text: "Добро пожаловать в #general!",
              sender: "System",
              timestamp: new Date().toISOString(),
            },
            {
              text: "Здесь пока пусто",
              sender: "System",
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          resolve([]);
        }
      }, 300);
    });
  }

  unsubscribeFromRoom(roomId) {
    const handler = this.messageHandlers.get(roomId);
    if (handler) {
      apiService.offMessage(handler);
      this.messageHandlers.delete(roomId);
    }
  }

  unsubscribeGlobal() {
    const handler = this.messageHandlers.get("global");
    if (handler) {
      apiService.offMessage(handler);
      this.messageHandlers.delete("global");
    }
  }

  sendGlobalMessage({ text, sender, tag = "general" }) {
    apiService.send({
      type: "MESSAGE",
      sender,
      text,
      tag,
      timestamp: new Date().toISOString(),
    });
  }

  sendRoomMessage(roomId, { text, sender, tag = "general" }) {
    apiService.send({
      type: "MESSAGE",
      chat: roomId,
      sender,
      text,
      tag,
      timestamp: new Date().toISOString(),
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  handleMessage(message) {
    this.subscribers.forEach((callback) => callback(message));
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  disconnect() {
    this.messageHandlers.forEach((handler, key) => {
      apiService.offMessage(handler);
    });
    this.messageHandlers.clear();
    this.subscribers.clear();
    apiService.disconnect();
  }
}

export const messageService = new MessageService();
