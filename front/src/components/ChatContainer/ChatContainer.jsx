import { useState, useEffect, useCallback  } from "react";
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
  const [darkTheme, setDarkTheme] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("chatTheme");

    if (savedTheme) {
      setDarkTheme(savedTheme === "dark");
    } else if (prefersDark) {
      setDarkTheme(true);
    }
  }, []);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("chatTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("chatTheme", "light");
    }
  }, [darkTheme]);

  const handleNewMessage = useCallback((newMessage) => {
    if (
      (currentRoom && newMessage.chat === currentRoom) ||
      (!currentRoom && newMessage.chat === "global")
    ) {
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [currentRoom]);
  
  useEffect(() => {
    if (!user) return;
  
    const initializeChat = async () => {
      try {
        await messageService.connect(user.username);
  
        const unsubscribe = messageService.subscribe(handleNewMessage);
  
        return () => {
          unsubscribe();
          messageService.disconnect();
        };
      } catch (error) {
        console.error("Chat initialization error:", error);
      }
    };
  
    initializeChat();
  }, [user, handleNewMessage]);

  const handleSendMessage = (content) => {
    if (!user) return;

    const message = {
      text: typeof content === "string" ? content : content.text,
      sender: user.username,
      tag: user.tag || null,
      timestamp: new Date().toISOString(),
    };

    const targetRoom = currentRoom || "global";
    messageService.sendMessage(targetRoom, message);
  };

    const handleRoomChange = async (room) => {
      setCurrentRoom(room);
      setMessages([]);

      if (room && room !== 'global') {
        try {
          await messageService.subscribeToRoom(room);
        } catch (error) {
          console.error("Failed to change room:", error);
        }
      }
  };

  return (
    <div className={`chatApp ${darkTheme ? "dark-theme" : ""}`}>
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

        <RoomList currentRoom={currentRoom} onSelectRoom={handleRoomChange} />
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
          <button
            className="theme-toggle"
            onClick={() => setDarkTheme(!darkTheme)}
          >
            {darkTheme ? "☀️ Light" : "🌙 Dark"}
          </button>
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