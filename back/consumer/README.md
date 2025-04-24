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

1. **`/send-message/client/{receiver}`**
   - **Description**: Sends a message to a specific client.
   - **Message Format** (JSON):
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag"
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
       "tag": "tag"
     }
     ```

2. **`kafka.chat.room.{chat}`**
   - **Description**: Topic for messages in specific chat rooms.
   - **Message Format**:
     ```json
     {
       "sender": "string",
       "text": "string",
       "tag": "tag"
     }
     ```