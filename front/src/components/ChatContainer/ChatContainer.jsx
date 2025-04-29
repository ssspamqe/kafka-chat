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
    // Убедитесь, что сообщение пришло для текущей комнаты
    if ((currentRoom && newMessage.chat === currentRoom) || 
        (!currentRoom && (!newMessage.chat || newMessage.chat === 'global'))) {
      setMessages(prev => [...prev, {
        ...newMessage,
        timestamp: newMessage.timestamp || new Date().toISOString()
      }]);
    }
  }, [currentRoom]);
  // const handleNewMessage = useCallback((newMessage) => {
   
  //   const messageRoom = newMessage.chat || newMessage.roomId;
  //   const current = currentRoom || 'global';
    
  //   if (messageRoom === current) {
  //     setMessages(prev => [...prev, {
  //       ...newMessage,
  //       timestamp: newMessage.timestamp || new Date().toISOString()
  //     }]);
  //   }
  // }, [currentRoom]);

  // const handleNewMessage = useCallback((newMessage) => {
  //   if (
  //     (currentRoom && newMessage.chat === currentRoom) ||
  //     (!currentRoom && newMessage.chat === "global")
  //   ) {
  //     setMessages((prev) => [...prev, newMessage]);
  //   }
  // }, [currentRoom]);
  
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
  const handleSendMessage = async (content) => {
    if (!user) return;
  

    const message = {
      text: content.text,
      sender: user.username,
      tag: content.shouldAttachTag ? user.tag : null, 
      timestamp: new Date().toISOString()
    };
  
    const targetRoom = currentRoom || "global";
  
    try {
     
      if (content.shouldAttachTag && targetRoom && targetRoom !== "global") {
        await authService.updateUserTag(targetRoom);
      }
      
      await messageService.sendMessage(targetRoom, message);
    } catch (error) {
      console.error("Ошибка отправки:", error);
    }
  };
  // const handleSendMessage = (content) => {
  //   if (!user) return;

  //   const message = {
  //     text: typeof content === "string" ? content : content.text,
  //     sender: user.username,
  //     tag: user.tag || null,
  //     timestamp: new Date().toISOString(),
  //   };

  //   const targetRoom = currentRoom || "global";
  //   messageService.sendMessage(targetRoom, message);
  // };

//     const handleRoomChange = async (room) => {
//       setCurrentRoom(room);
  
 
//   try {
//     const history = await messageService.loadHistory(room || 'global');
//     setMessages(history);
    
//     if (room && room !== 'global') {
//       await messageService.subscribeToRoom(room);
//     }
//   } catch (error) {
//     console.error("Room change error:", error);
//   }
// };
const handleRoomChange = async (room) => {
  setCurrentRoom(room);
  
  try {
    // Отписываемся от предыдущей комнаты (если нужно)
    if (currentRoom && currentRoom !== 'global') {
      await messageService.unsubscribeFromRoom(currentRoom);
    }
    
    // Загружаем историю новой комнаты
    const history = await messageService.loadHistory(room || 'global');
    setMessages(history);
    
    // Подписываемся на новую комнату
    if (room && room !== 'global') {
      await messageService.subscribeToRoom(room);
    }
  } catch (error) {
    console.error("Room change error:", error);
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
