import { useEffect, useState } from 'react';
import { messageService } from '../../services/messageService';
import styles from './UserList.module.css';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleUserActivity = (message) => {
      if (message.type === 'USER_JOIN' || message.type === 'USER_LEAVE') {
        setUsers(prev => {
          if (message.type === 'USER_JOIN') {
            return [...prev, message.user];
          }
          return prev.filter(u => u.id !== message.user.id);
        });
      }
    };

    const unsubscribe = messageService.subscribe(handleUserActivity);

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.userList}>
      <h3>Online Users ({users.length})</h3>
      <ul className={styles.list}>
        {users.map(user => (
          <li key={user.id} className={styles.userItem}>
            <span className={styles.username}>{user.username}</span>
            <span className={styles.tag}>{user.tag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;