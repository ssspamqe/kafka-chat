
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/authService';
import { apiService } from '../../services/apiService';
import './MessageInput.css';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTagged, setIsTagged] = useState(false);
  const [userTag, setUserTag] = useState('');
  const [isEditingTag, setIsEditingTag] = useState(false);
  const inputRef = useRef(null);
  const tagInputRef = useRef(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadUserTag = async () => {
      if (user?.username) {
        try {
          const { current_tag } = await apiService.getUserTags(user.username);
          if (current_tag) {
            setUserTag(current_tag);
            setIsTagged(true);
          }
        } catch (error) {
          console.error("Failed to load user tag:", error);
        }
      }
    };
    
    loadUserTag();
  }, [user]);

  const handleTagToggle = async (e) => {
    e.stopPropagation();
    const newTaggedState = !isTagged;
    setIsTagged(newTaggedState);
    
    try {
      if (user?.username) {
        await apiService.updateUserTag(
          user.username, 
          newTaggedState ? userTag : null
        );
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      setIsTagged(!newTaggedState);
    }
  };

  const startEditingTag = () => {
    setIsEditingTag(true);
    setTimeout(() => tagInputRef.current?.focus(), 0);
  };

  const saveUserTag = async () => {
    setIsEditingTag(false);
    
    try {
      if (user?.username) {
        await apiService.updateUserTag(
          user.username, 
          isTagged ? userTag : null
        );
      }
    } catch (error) {
      console.error("Error saving user tag:", error);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveUserTag();
    } else if (e.key === 'Escape') {
      setIsEditingTag(false);
    }
  };

  const addEmoji = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend({
        text: message.trim(),
        sender: user?.username,
        tag: isTagged ? userTag : null,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="form">
        <div className="tag-controls">
          <div className="tag-toggle">
            <label onClick={(e) => e.preventDefault()}>
              <input 
                type="checkbox" 
                checked={isTagged}
                onChange={handleTagToggle}
                onClick={(e) => e.stopPropagation()}
              />
              <b>Use tag</b>
            </label>
          </div>
          
          {isTagged && (
            <div className="tag-input-container">
              {isEditingTag ? (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={userTag}
                  onChange={(e) => setUserTag(e.target.value)}
                  onBlur={saveUserTag}
                  onKeyDown={handleTagKeyDown}
                  className="tag-input"
                  placeholder="Enter your tag"
                  maxLength="20"
                />
              ) : (
                <span 
                  className="tag-display" 
                  onClick={startEditingTag}
                >
                  {userTag || 'Set your tag...'}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="input-container">
          <button 
            type="button" 
            className="icon-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Emoji picker"
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
            aria-label="Message input"
          />

          <button 
            type="submit" 
            className="button" 
            disabled={!message.trim()}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
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
