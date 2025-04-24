import { useState, useEffect } from 'react';
import { messageService } from '../../services/messageService';
import './MessageList.css';

const MessageList = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = messageService.subscribe((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="list">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          <span className="sender">{msg.sender}:</span>
          <span className="text">{msg.text}</span>
          {msg.tag && <span className="tag">{msg.tag}</span>}
        </div>
      ))}
    </div>
  );
};

export default MessageList;