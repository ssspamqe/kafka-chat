import { useState } from 'react';
import styles from './RoomList.module.css';

const DEFAULT_ROOM = ['general'];

const RoomList = ({ currentRoom, onSelectRoom }) => {
  const [rooms, setRooms] = useState(DEFAULT_ROOM);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName.trim() && !rooms.includes(newRoomName)) {
      setRooms([...rooms, newRoomName.trim()]);
      setNewRoomName('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.rooms}>
        <div 
          className={`${styles.room} ${!currentRoom ? styles.active : ''}`}
          onClick={() => onSelectRoom(null)}
        >
          Global Chat
        </div>
        
        {rooms.map(room => (
          <div
            key={room}
            className={`${styles.room} ${currentRoom === room ? styles.active : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            #{room}
          </div>
        ))}
      </div>

      <div className={styles.createRoom}>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New room name"
          className={styles.input}
        />
        <button 
          onClick={handleCreateRoom}
          className={styles.button}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default RoomList;