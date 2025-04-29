import EmojiPicker from 'emoji-picker-react';
import { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const addEmoji = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="form">
        <div className="input-container">
          <button 
            type="button" 
            className="icon-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input"
          />
        </div>
        
        <button type="submit" className="button" disabled={!message.trim()}>
          Send
        </button>
      </form>

      {showEmojiPicker && (
        <div className="picker-container">
          <EmojiPicker 
            onEmojiClick={addEmoji}
            width="100%"
            height={350}
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;