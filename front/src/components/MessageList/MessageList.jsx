import { useRef, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import './MessageList.css';

const MessageList = ({ messages = [] }) => {
  const user = authService.getCurrentUser();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const prevMessagesLength = useRef(messages.length);

 
  useEffect(() => {
    scrollToBottom();
  }, []);


  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLength.current;
    prevMessagesLength.current = messages.length;

    if (isNewMessage && isAutoScrolling) {
      scrollToBottom();
    }
  }, [messages, isAutoScrolling]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };


  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;
      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsAutoScrolling(distanceToBottom <= threshold);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="messages-container" ref={messagesContainerRef}>
      {messages.map((msg, index) => {
        const isOutgoing = msg.sender === user?.username;
        const showSender = !isOutgoing && (index === 0 || messages[index-1].sender !== msg.sender);

        return (
          <div 
            key={index} 
            className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}
          >
            {showSender && (
              <div className="message-header">
                <span className="message-sender">{msg.sender}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )}
            <div className="message-content">
              {msg.type === 'gif' ? (
                <img 
                  src={msg.gifUrl} 
                  alt="GIF" 
                  style={{ maxWidth: '100%', borderRadius: '12px' }}
                />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
            <span className="message-time" style={{
              display: 'block',
              textAlign: isOutgoing ? 'right' : 'left',
              marginTop: '2px',
              fontSize: '0.7rem'
            }}>
              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        );
      })}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>
  );
}

export default MessageList;
