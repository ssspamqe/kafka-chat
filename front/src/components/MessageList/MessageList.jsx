

import { useRef, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { messageService } from '../../services/messageService';
import { apiService } from '../../services/apiService';
import './MessageList.css';

const MessageList = ({ messages = [], currentRoom }) => {
  const user = authService.getCurrentUser();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const prevMessagesLength = useRef(messages.length);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showTagSelector, setShowTagSelector] = useState(false); //

  useEffect(() => {
    const fetchUserTags = async () => {
      try {
        const response = await apiService.sendRequest(
          `/user/${user.username}/tags`,
          {},
          'GET',
          'MONGO'
        );
        setAvailableTags(response.tags || []);
      } catch (error) {
        console.error("Ошибка загрузки тегов:", error);
      }
    };

    if (user?.username) {
      fetchUserTags();
    }
  }, [user]);

  const handleSendMessage = async (content) => {
    if (!user) return;

    try {
      const message = {
        text: content.text,
        sender: user.username,
        tag: selectedTag || content.tag || null,
        timestamp: new Date().toISOString()
      };

      const targetRoom = currentRoom || "global";

      if (selectedTag) {
        await apiService.sendRequest(
          `/user/${user.username}/tag`,
          { tag: selectedTag },
          'POST',
          'MONGO'
        );
      }

      await messageService.sendMessage(targetRoom, message);
      setSelectedTag(null);
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const handleTagSelect = async (tag) => {
    try {
      setSelectedTag(tag);
      setShowTagSelector(false);

      const response = await apiService.sendRequest(
        `/user/${user.username}/tag`,
        { tag },
        'POST',
        'MONGO'
      );

      if (response.success) {
        const updatedUser = { ...user, tag };
        authService.updateCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Ошибка обновления тега:", error);
    }
  };

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
        const showSender = !isOutgoing && (index === 0 || messages[index - 1].sender !== msg.sender);

        return (
          <div
            key={index}
            className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}
          >
            {showSender && (
              <div className="message-header">
                <span className="message-sender">{msg.sender}</span>
                {msg.tag && (
                  <span
                    className="message-tag"
                    onClick={() => handleTagSelect(msg.tag)}
                  >
                    #{msg.tag}
                  </span>
                )}
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="message-content">
              {msg.tag && !showSender && (
                <span
                  className="message-tag"
                  onClick={() => handleTagSelect(msg.tag)}
                >
                  #{msg.tag}
                </span>
              )}
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
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

export default MessageList;

