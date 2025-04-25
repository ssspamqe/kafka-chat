class MockApiService {
    constructor() {
      this.messageCallbacks = [];
      this.connected = false;
      this.mockMessages = [
        { sender: "Bot", text: "Добро пожаловать в чат!", tag: "system" },
        { sender: "User1", text: "Привет!", tag: "general" },
        { sender: "User2", text: "Как дела?", tag: "general" }
      ];
    }
  
    connect() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.connected = true;
          this._startMockMessages();
          resolve();
        }, 500);
      });
    }
  
    _startMockMessages() {
      let index = 0;
      this.interval = setInterval(() => {
        if (index < this.mockMessages.length) {
          this.messageCallbacks.forEach(cb => cb(this.mockMessages[index]));
          index++;
        }
      }, 1500);
    }
  
    onMessage(callback) {
      this.messageCallbacks.push(callback);
      return () => {
        this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
      };
    }

    offMessage(callback) {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    }
  
    send(message) {
      console.log("Mock send:", message);
      setTimeout(() => {
        this.messageCallbacks.forEach(cb => cb({
          ...message,
          timestamp: new Date().toISOString()
        }));
      }, 300);
    }
  
    disconnect() {
      clearInterval(this.interval);
      this.connected = false;
    }
  }
  
  export const mockApiService = new MockApiService();