import { useState, useEffect, useRef } from 'react';
import { messageService } from '../../services/messageService';
import { authService } from '../../services/authService';
import './MessageList.css';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const user = authService.getCurrentUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = messageService.subscribe((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messages-container">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`message ${msg.sender === user?.username ? 'outgoing' : 'incoming'}`}
        >
          <div className="message-header">
            <span className="message-sender">{msg.sender}</span>
            <span className="message-time">{formatTime(msg.timestamp || new Date().toISOString())}</span>
          </div>
          <div className="message-content">
            <p>{msg.text}</p>
            {msg.tag && <span className="message-tag">{msg.tag}</span>}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;