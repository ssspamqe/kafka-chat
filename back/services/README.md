# Kafka Chat Services

## Overview
The Kafka Chat Services module is responsible for managing the backend logic of the Kafka Chat system. It includes data repositories, models, and migration scripts to handle user and message data efficiently.

---

## Features
- **Data Repositories**: Interfaces for interacting with MongoDB collections.
- **Data Models**: MongoDB models for users and messages.
- **Migration Scripts**: Tools for initializing and migrating MongoDB data.

---

## Prerequisites
- Python 3.9 or higher
- MongoDB server running and accessible

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd kafka-chat/back/services
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## How to Use

1. **Run the Migration Script**:
   ```bash
   python data/mongo_migration.py
   ```

2. **Access the Data Repositories**:
   - `messages_repository.py`: For managing message data.
   - `users_repository.py`: For managing user data.

---

## Project Structure
- **`main.py`**: Entry point of the application.
- **`data/`**: Contains data repositories and migration scripts.
- **`models/`**: MongoDB models for users and messages.
- **`config/`**: Configuration files for logging and application settings.

---

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License.