import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter username');
      return;
    }
    login(username);
    onLogin();
  };

  return (
    <div className="loginContainer">
      <h2>Welcome to Kafka Chat</h2>
      <form onSubmit={handleSubmit} className="loginForm">
        <div className="formGroup">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="input"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="button">
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default Login;