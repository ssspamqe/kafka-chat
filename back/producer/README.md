# Kafka Chat Producer

## How to Start the Server

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Access the API Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Contract

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

## Kafka Contract

### Topics

(if the required topic does not exist, it will be created automatically )

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