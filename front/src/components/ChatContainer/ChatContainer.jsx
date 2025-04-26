
import { useState, useEffect } from "react";
import { messageService } from "../../services/messageService";
import { authService } from "../../services/authService";
import MessageList from "../MessageList/MessageList";
import MessageInput from "../MessageInput/MessageInput";
import RoomList from "../RoomList/RoomList";
import "./ChatContainer.css";

const ChatContainer = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const roomMessages = await messageService.loadRoomMessages(
          currentRoom || "global"
        );
        setMessages(roomMessages);

        if (currentRoom) {
          await messageService.connectToRoom(currentRoom);
        } else {
          await messageService.connectToGlobalChat();
        }

        const unsubscribe = messageService.subscribe((newMessage) => {
          if (!messages.some((m) => m.timestamp === newMessage.timestamp)) {
            setMessages((prev) => [...prev, newMessage]);
          }
        });

        return () => {
          unsubscribe();
          messageService.disconnect();
        };
      } catch (error) {
        console.error("Connection error:", error);
      }
    };

    loadData();
  }, [currentRoom]);

  const handleSendMessage = (text) => {
    if (!user) return;

    const message = {
      text,
      sender: user.username,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);

    currentRoom
      ? messageService.sendRoomMessage(currentRoom, message)
      : messageService.sendGlobalMessage(message);
  };

  return (
    <div className="chatApp">
      <button
        className="mobileMenuToggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <span className="closeIcon">✕</span>
        ) : (
          <>
            <span className="menuLine"></span>
            <span className="menuLine"></span>
            <span className="menuLine"></span>
          </>
        )}
      </button>

      <div className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="userProfile">
          <div className="avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="userInfo">
            <span className="username">{user?.username}</span>
          </div>
        </div>

        <RoomList
          currentRoom={currentRoom}
          onSelectRoom={(room) => {
            setCurrentRoom(room);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>
      <div className="mainContent">
        <div className="chatHeader">
          <div className="roomInfo">
            <h2>{currentRoom ? `#${currentRoom}` : "🌐 Global Chat"}</h2>
            <div className="roomStats">
              <span className="messageCount">
                💬 {messages.length} messages
              </span>
            </div>
          </div>
        </div>

        <div className="messageArea">
          <MessageList messages={messages} />
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatContainer;
