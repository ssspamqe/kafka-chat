# Kafka Chat Project

## Overview
Kafka Chat is a distributed chat application built using Kafka, FastAPI, and React. It supports real-time messaging, user authentication, and scalable architecture for handling multiple chat rooms and global communication.

---

## Project Structure

### Backend
- **Consumer Service**: Handles WebSocket connections and consumes messages from Kafka topics.
- **Producer Service**: Sends messages to Kafka topics.
- **Services Module**: Manages data repositories, models, and migration scripts.

### Frontend
- **React Application**: Provides a user interface for interacting with the Kafka Chat system.

---

## Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- Kafka server running and accessible
- MongoDB server running and accessible

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd kafka-chat
   ```

2. **Set Up Backend Services**:
   - Navigate to each backend service folder (`back/consumer`, `back/producer`, `back/services`) and follow their respective README.md instructions.

3. **Set Up Frontend**:
   - Navigate to `front` and follow the README.md instructions.

---

## How to Run the Project

1. **Start Kafka and MongoDB**:
   Ensure Kafka and MongoDB servers are running.

2. **Start Backend Services**:
   - Run the consumer, producer, and services modules as described in their README.md files.

3. **Start Frontend**:
   - Run the React application using `npm start`.

4. **Access the Application**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Run the Project with Docker

To simplify the setup and deployment of the Kafka Chat project, Docker is used to containerize all services. Follow these steps to run the project using Docker:

### Prerequisites
- Ensure Docker and Docker Compose are installed on your system.
- Verify that Docker is running.

### Steps to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd kafka-chat
   ```

2. **Build and Start the Containers**:
   - Run the following command in the root directory of the project (where `docker-compose.yml` is located):
     ```bash
     docker-compose up --build
     ```
   - This command will build Docker images for all services (frontend, backend consumer, backend producer, and services) and start the containers.

3. **Verify the Containers are Running**:
   - Use the following command to check the status of the containers:
     ```bash
     docker ps
     ```
   - Ensure all required containers (frontend, consumer, producer, services, Kafka, MongoDB) are running.

4. **Access the Application**:
   - **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
   - **Backend Consumer**: API available at [http://localhost:8001](http://localhost:8001).
   - **Backend Producer**: API available at [http://localhost:8000](http://localhost:8000).

5. **Stop the Containers**:
   - To stop all running containers, use:
     ```bash
     docker-compose down
     ```

### Notes
- The `docker-compose.yml` file defines the services, networks, and volumes required for the project.
- Ensure that Kafka and MongoDB services are properly configured and running within the Docker environment.
- Logs for each service can be viewed using:
  ```bash
  docker-compose logs -f <service-name>
  ```
  Replace `<service-name>` with the name of the service (e.g., `consumer`, `producer`, `frontend`, `services`).

---

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License.