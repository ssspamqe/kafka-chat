import { useState } from 'react';
import styles from './RoomList.module.css';

const DEFAULT_ROOMS = ['general', 'random', 'help'];

const RoomList = ({ currentRoom, onSelectRoom }) => {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = () => {
    if (newRoomName.trim() && !rooms.includes(newRoomName.trim())) {
      setRooms([...rooms, newRoomName.trim()]);
      setNewRoomName('');
      setIsCreatingRoom(false);
      onSelectRoom(newRoomName.trim());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Chat Rooms</h3>
        <button 
          className={styles.addButton}
          onClick={() => setIsCreatingRoom(!isCreatingRoom)}
        >
          {isCreatingRoom ? '×' : '+'}
        </button>
      </div>

      <div className={styles.rooms}>
        <div 
          className={`${styles.room} ${!currentRoom ? styles.active : ''}`}
          onClick={() => onSelectRoom(null)}
        >
          <span className={styles.globalIcon}>🌐</span>
          Global Chat
        </div>
        
        {rooms.map(room => (
          <div
            key={room}
            className={`${styles.room} ${currentRoom === room ? styles.active : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <span className={styles.roomIcon}>#</span>
            {room}
          </div>
        ))}
      </div>

      {isCreatingRoom && (
        <div className={styles.createRoom}>
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name"
            className={styles.input}
            autoFocus
          />
          <div className={styles.actions}>
            <button 
              onClick={() => setIsCreatingRoom(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateRoom}
              className={styles.createButton}
              disabled={!newRoomName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;