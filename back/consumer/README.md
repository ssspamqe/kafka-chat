# Kafka Chat Consumer

## Overview
The Kafka Chat Consumer is a FastAPI-based microservice designed to handle WebSocket connections and consume messages from Kafka topics. It facilitates real-time communication by subscribing users to specific topics and delivering messages efficiently.

---

## Features
- **WebSocket Endpoints**: Real-time communication with clients.
- **Kafka Integration**: Subscribes to Kafka topics and processes messages.
- **Health Check**: Ensures the service is running and operational.

---

## Prerequisites
- Python 3.9 or higher
- Kafka server running and accessible

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd kafka-chat/back/consumer
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## How to Start the Server

1. **Run the Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001
   ```

2. **Access the API Documentation**:
   - Swagger UI: [http://localhost:8001/docs](http://localhost:8001/docs)
   - ReDoc: [http://localhost:8001/redoc](http://localhost:8001/redoc)

---

## API Endpoints

### WebSocket Endpoints

1. **`/receive-message/client/{username}`**
   - **Description**: Receives messages to a specific client.
   - **Message Format** (JSON):
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag",
       "chat": "chat_name"
     }
     ```

2. **`/subscribing/{username}`**
   - **Description**: Subscribes a user to a Kafka topic.
   - **Parameters**:
     - `username`: The username of the client.
     - `topic`: The Kafka topic to subscribe to.

3. **`/health`**
   - **Description**: Health check endpoint to verify the consumer is running.
   - **Response**:
     ```json
     {
       "status": "Consumer is running"
     }
     ```

---

## Kafka Topics

1. **`kafka.chat.global`**
   - **Description**: Topic for global messages.
   - **Message Format**:
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag",
       "topic": "kafka.chat.global"
     }
     ```

2. **`kafka.chat.{chat}`**
   - **Description**: Topic for messages in specific chat rooms.
   - **Message Format**:
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag",
       "topic": "kafka.chat.{chat}"
     }
     ```

---

## Project Structure
- **`main.py`**: Entry point of the application.
- **`custom_websockets/`**: Contains WebSocket endpoint implementations.
- **`custom_kafka/`**: Kafka consumer logic.
- **`config/`**: Configuration files for logging and application settings.

---

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License.