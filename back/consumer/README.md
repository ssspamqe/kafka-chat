# Kafka Chat Consumer

## How to Start the Server

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001
   ```

3. **Access the API Documentation**:
   - Swagger UI: [http://localhost:8001/docs](http://localhost:8001/docs)
   - ReDoc: [http://localhost:8001/redoc](http://localhost:8001/redoc)

---

## API Contract

### WebSocket Endpoints

1. **`/send-message/client/{username}`**
   - **Description**: Sends messages to a specific client.
   - **Message Format** (JSON):
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag",
       "topic": "topic_name"
     }
     ```

2. **`/health`**
   - **Description**: Health check endpoint to verify the consumer is running.
   - **Response**:
     ```json
     {
       "status": "Consumer is running"
     }
     ```

---

## Kafka Contract

### Topics

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

2. **`kafka.chat.room.{chat}`**
   - **Description**: Topic for messages in specific chat rooms.
   - **Message Format**:
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag",
       "topic": "kafka.chat.room.{chat}"
     }
     ```