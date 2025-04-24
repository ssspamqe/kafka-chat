import { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="input"
      />
      <button type="submit" className="button">
        Send
      </button>
    </form>
  );
};

export default MessageInput;