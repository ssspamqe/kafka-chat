import { useState, useEffect } from 'react';
import { messageService } from '../../services/messageService';
import { authService } from '../../services/authService';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import RoomList from '../RoomList/RoomList';
import './ChatContainer.css';

const ChatContainer = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadMessages = async () => {
      if (currentRoom) {
        const roomMessages = await messageService.loadRoomMessages(currentRoom);
        setMessages(roomMessages);
        messageService.connectToRoom(currentRoom);
      } else {
        const globalMessages = await messageService.loadRoomMessages('global');
        setMessages(globalMessages);
        messageService.connectToGlobalChat();
      }
    };

    loadMessages();

    return () => messageService.disconnect();
  }, [currentRoom]);

  const handleSendMessage = (text) => {
    if (!user) return;

    const message = {
      text,
      sender: user.username,
      timestamp: new Date().toISOString()
    };

    currentRoom 
      ? messageService.sendRoomMessage(currentRoom, message)
      : messageService.sendGlobalMessage(message);
  };

  return (
    <div className="chatApp">
     
      <button 
        className="mobileMenuToggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <span className="closeIcon">✕</span>
        ) : (
          <>
            <span className="menuLine"></span>
            <span className="menuLine"></span>
            <span className="menuLine"></span>
          </>
        )}
      </button>

     
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="userProfile">
          <div className="avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="userInfo">
            <span className="username">{user?.username}</span>
            <span className="status">
              <span className="statusIndicator"></span> Online
            </span>
          </div>
        </div>
        
        <RoomList 
          currentRoom={currentRoom}
          onSelectRoom={(room) => {
            setCurrentRoom(room);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      
      <div className="mainContent">
        <div className="chatHeader">
          <div className="roomInfo">
            <h2>{currentRoom ? `#${currentRoom}` : '🌐 Global Chat'}</h2>
            <div className="roomStats">
              <span className="activeUsers">👥 42 online</span>
              <span className="messageCount">💬 128 messages</span>
            </div>
          </div>
        </div>
        
        <div className="messageArea">
          <MessageList />
        </div>
        
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatContainer;