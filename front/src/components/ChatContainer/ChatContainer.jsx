import { useState, useEffect } from 'react';
import { messageService } from '../../services/messageService';
import { authService } from '../../services/authService';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import RoomList from '../RoomList/RoomList';
import './ChatContainer.css';

const ChatContainer = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (currentRoom) {
      messageService.connectToRoom(currentRoom);
    } else {
      messageService.connectToGlobalChat();
    }

    return () => messageService.disconnect();
  }, [currentRoom]);

  const handleSendMessage = (text) => {
    if (!user) return;

    const message = {
      text,
      sender: user.username,
    };

    currentRoom 
      ? messageService.sendRoomMessage(currentRoom, message)
      : messageService.sendGlobalMessage(message);
  };

  return (
    <div className="container">
      <RoomList 
        currentRoom={currentRoom}
        onSelectRoom={setCurrentRoom}
      />
      
      <div className="chatArea">
        <MessageList />
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatContainer;