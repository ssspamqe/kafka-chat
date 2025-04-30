import { useState, useEffect, useRef, useCallback } from "react";
import { authService } from "../../services/authService";
import styles from "./RoomList.module.css";
import { messageService } from "../../services/messageService";

const RoomList = ({ currentRoom, onSelectRoom }) => {
  const [localRooms, setLocalRooms] = useState(() => {
    const user = authService.getCurrentUser();
    return ["global", ...user?.chats || []];
  });

  const [newRoomName, setNewRoomName] = useState("");
  const [isJoinRoom, setIsJoinRoom] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const roomsContainerRef = useRef(null);
  const roomsEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = authService.getCurrentUser();

  const handleJoinRoom = useCallback(async () => {
    const roomName = newRoomName.trim();
    if (!roomName || !user?.username) return;

    try {
      setIsLoadingRooms(true);
      setError("");

      setLocalRooms((prev) => [...prev, roomName]);

      const updatedUser = {
        ...user,
        chats: [...(user.chats || []), roomName],
      };
      authService.updateCurrentUser(updatedUser);

      //нужно засунуть в бд

      await messageService.subscribeToRoom(roomName);

      setLocalRooms((prev) => [...new Set([...prev, roomName])]);
      setNewRoomName("");
      setIsJoinRoom(false);
      onSelectRoom(roomName);
    } catch (error) {
      setError(
        error.message.includes("exists")
          ? "Room already exists"
          : "Failed to join room. Please try later."
      );
    } finally {
      setIsLoadingRooms(false);
    }
  }, [newRoomName, user, onSelectRoom]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleJoinRoom();
      }
    },
    [handleJoinRoom]
  );

  useEffect(() => {
    if (isJoinRoom && roomsEndRef.current) {
      roomsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (isJoinRoom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isJoinRoom]);

  const handleRoomSelect = useCallback(
    async (room) => {
      if (room === currentRoom || isLoadingRooms) return;

      try {
        if (!messageService.localRooms.has(room)) {
          await messageService.subscribeToRoom(room);
        }
        onSelectRoom(room === "global" ? null : room);
      } catch (err) {
        setError(`Ошибка входа в ${room}`);
      }
    },
    [currentRoom, isLoadingRooms, onSelectRoom]
  );

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

            {localRooms
              .filter((room) => room !== "global")
              .map((room) => (
                <div
                  key={room}
                  className={`${styles.room} ${
                    currentRoom === room ? styles.active : ""
                  }`}
                  onClick={() => handleRoomSelect(room)}
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
              ref={inputRef}
              type="text"
              value={newRoomName}
              onChange={(e) => {
                setNewRoomName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
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
            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
