import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';

export const useChat = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    setIsLoading(true);
    
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const initChat = async () => {
      try {
        if (roomId) {
          await messageService.connectToRoom(roomId);
        } else {
          await messageService.connectToGlobalChat();
        }
        
        messageService.subscribe(handleNewMessage);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      messageService.unsubscribe(handleNewMessage);
      messageService.disconnect();
    };
  }, [roomId]);

  const sendMessage = (text) => {
    if (!user || !text.trim()) return;

    const message = {
      text,
      sender: user.username,
    };

    if (roomId) {
      messageService.sendRoomMessage(roomId, message);
    } else {
      messageService.sendGlobalMessage(message);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    currentUser: user
  };
};