import { useEffect, useRef, useState } from 'react';
import { apiService } from '../services/apiService';

export const useWebSocket = (endpoint) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await apiService.connect(endpoint);
        wsRef.current = apiService;
        setIsConnected(true);
        
        const unsubscribe = apiService.onMessage((message) => {
          setMessages(prev => [...prev, message]);
        });

        return () => {
          unsubscribe();
          apiService.disconnect();
          setIsConnected(false);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
      }
    };

    connect();

    return () => {
      apiService.disconnect();
    };
  }, [endpoint]);

  const sendMessage = (message) => {
    if (isConnected) {
      apiService.send(message);
    }
  };

  return { isConnected, messages, sendMessage };
};