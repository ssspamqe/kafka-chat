# Kafka Chat Producer

## Overview
The Kafka Chat Producer is a FastAPI-based microservice responsible for sending messages to Kafka topics. It enables real-time communication by publishing messages to specific chat rooms or globally.

---

## Features
- **WebSocket Endpoints**: Send messages to chat rooms or globally.
- **Kafka Integration**: Publishes messages to Kafka topics.
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
   cd kafka-chat/back/producer
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## How to Start the Server

1. **Run the Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Access the API Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints

### WebSocket Endpoints

1. **`/send-message/chat/{chat}`**
   - **Description**: Sends a message to a specific chat room.
   - **Message Format** (JSON):
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag"
     }
     ```

2. **`/send-message/global`**
   - **Description**: Sends a global message to all users.
   - **Message Format** (JSON):
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag"
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
       "tag": "tag"
     }
     ```

2. **`kafka.chat.{chat}`**
   - **Description**: Topic for messages in specific chat rooms.
   - **Message Format**:
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag"
     }
     ```

---

## Project Structure
- **`main.py`**: Entry point of the application.
- **`custom_websockets/`**: Contains WebSocket endpoint implementations.
- **`custom_kafka/`**: Kafka producer logic.
- **`config/`**: Configuration files for logging and application settings.

---

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License.