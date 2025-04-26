import { useRef, useEffect } from 'react';
import { authService } from '../../services/authService';
import './MessageList.css';

const MessageList = ({ messages = [] }) => {
  const user = authService.getCurrentUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`message ${msg.sender === user?.username ? 'outgoing' : 'incoming'}`}
        >
          <div className="message-header">
            <span className="message-sender">{msg.sender}</span>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">
            <p>{msg.text}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;