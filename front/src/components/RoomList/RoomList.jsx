import { useState, useEffect, useRef } from "react";
import { authService } from "../../services/authService";
import { apiService } from "../../services/apiService";
import styles from "./RoomList.module.css";
import { messageService } from "../../services/messageService";

const RoomList = ({ currentRoom, onSelectRoom }) => {
  const [rooms, setRooms] = useState(["global"]);
  const [newRoomName, setNewRoomName] = useState("");
  const [isJoinRoom, setIsJoinRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const roomsContainerRef = useRef(null);
  const roomsEndRef = useRef(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (isJoinRoom && roomsEndRef.current) {
      roomsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isJoinRoom]);

  useEffect(() => {
    const loadRooms = async () => {
      if (!user) return;

      try {
        const userData = await apiService.sendRequest(
          `/user/${user.username}`,
          {},
          "GET"
        );
        setRooms(["global", ...(userData.chats || [])]);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };

    loadRooms();
  }, [user]);

  const handleJoinRoom = async () => {
    const roomName = newRoomName.trim();
    if (!roomName || !user.username) return;

    try {
      setIsLoadingRooms(true);
      await messageService.subscribeToRoom(roomName);

      setRooms((prev) => [...new Set([...prev, roomName])]);
      setNewRoomName("");
      setIsJoinRoom(false);
      onSelectRoom(roomName);
    } catch (error) {
      setErrorMessage(
        error.message.includes("exists")
          ? "Room already exists"
          : "Failed to join room. Please try later."
      );
    } finally {
      setIsLoadingRooms(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Chat Rooms</h3>
        <button
          className={styles.addButton}
          onClick={() => setIsJoinRoom(!isJoinRoom)}
          disabled={isLoadingRooms}
        >
          {isJoinRoom ? "×" : "+"}
        </button>
      </div>

      <div className={styles.roomsContainer} ref={roomsContainerRef}>
        {isLoadingRooms ? (
          <div className={styles.loading}>Loading rooms...</div>
        ) : (
          <div className={styles.rooms}>
            <div
              className={`${styles.room} ${!currentRoom ? styles.active : ""}`}
              onClick={() => onSelectRoom(null)}
            >
              <span className={styles.globalIcon}>🌐</span>
              Global Chat
            </div>

            {rooms
              .filter((room) => room !== "global")
              .map((room) => (
                <div
                  key={room}
                  className={`${styles.room} ${
                    currentRoom === room ? styles.active : ""
                  }`}
                  onClick={() => onSelectRoom(room)}
                >
                  <span className={styles.roomIcon}>#</span>
                  {room}
                </div>
              ))}
            <div ref={roomsEndRef} />
          </div>
        )}

        {isJoinRoom && (
          <div className={styles.createRoom}>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => {
                setNewRoomName(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter room name"
              className={styles.input}
              autoFocus
            />
            <div className={styles.actions}>
              <button
                onClick={() => setIsJoinRoom(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                className={styles.joinButton}
                disabled={!newRoomName.trim()}
              >
                Join
              </button>
            </div>
            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
