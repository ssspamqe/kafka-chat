import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import styles from './App.module.css';
import ChatContainer from './components/ChatContainer/ChatContainer';
import Login from './components/Login/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthProvider>
      <div className={styles.app}>
        {!isAuthenticated ? (
          <Login onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <ChatContainer onLogout={() => setIsAuthenticated(false)} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;