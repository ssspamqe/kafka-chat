import {apiService} from "./apiService";

class MessageService {
  constructor() {
    this.subscribers = new Set();
    this.messageHandlers = new Map();
  }

  async connectToGlobalChat() {
    //await apiService.connect("/send-message/global");
    await apiService.connect();
    const handler = this.handleMessage.bind(this);
    this.messageHandlers.set('global', handler);
    apiService.onMessage(handler);
  }

  async connectToRoom(roomId) {
    await apiService.connect(`/send-message/chat/${roomId}`);
    const handler = this.handleMessage.bind(this);
    this.messageHandlers.set(roomId, handler);
    apiService.onMessage(handler);
  }

  unsubscribeFromRoom(roomId) {
    const handler = this.messageHandlers.get(roomId);
    if (handler) {
      apiService.offMessage(handler);
      this.messageHandlers.delete(roomId);
    }
  }

  unsubscribeGlobal() {
    const handler = this.messageHandlers.get('global');
    if (handler) {
      apiService.offMessage(handler);
      this.messageHandlers.delete('global');
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
