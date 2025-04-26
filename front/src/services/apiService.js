class ApiService {
  constructor() {
    this.producerSocket = null;
    this.consumerSocket = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connectToConsumer(endpoint) {
    return this._connect(endpoint, 'consumer', 'ws://localhost:8000');
  }

  async connectToProducer(endpoint) {
    return this._connect(endpoint, 'producer', 'ws://localhost:8001');
  }

  _connect(endpoint, type, baseUrl) {
    return new Promise((resolve, reject) => {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Connecting to ${type} at ${url}`);

      const socket = new WebSocket(url);
      this[`${type}Socket`] = socket;

      socket.onopen = () => {
        console.log(`${type} connected`);
        this.reconnectAttempts = 0;
        resolve();
      };
      socket.onerror = (error) => {
        console.error(`${type} error:`, error);
        reject(error);
      };

      socket.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this._connect(endpoint, type, baseUrl);
          }, 1000 * this.reconnectAttempts);
        }
      };

      if (type === 'consumer') {
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.messageCallbacks.forEach(cb => cb(message));
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };
      }
    });
  }

  send(data) {
    if (this.producerSocket?.readyState === WebSocket.OPEN) {
      this.producerSocket.send(JSON.stringify(data));
    } else {
      console.error('Producer socket not connected');
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    this.producerSocket?.close();
    this.consumerSocket?.close();
    this.messageCallbacks = [];
  }
}

export const apiService = new ApiService();
