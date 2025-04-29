import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(username);
      onLogin();
    } catch (error) {
      setError(error.message.includes('already exists') 
        ? 'Username already taken' 
        : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomName = () => {
    const adjectives = ['Happy', 'Clever', 'Swift', 'Gentle', 'Brave', 'Calm'];
    const nouns = ['Fox', 'Bear', 'Eagle', 'Dolphin', 'Tiger', 'Owl'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    setUsername(`${randomAdj}${randomNoun}${Math.floor(Math.random() * 100)}`);
  };

  return (
    <div className="loginContainer">
      <h2 className="loginTitle">Welcome to Kafka Chat</h2>
      <form onSubmit={handleSubmit} className="loginForm">
        <div className="formGroup">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Your chat name"
            className="input"
            autoFocus
          />
        </div>
        
        {error && <div className="error">{error}</div>}

        <div className="buttonGroup">
          <button 
            type="submit" 
            className="button primaryButton"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entering...' : 'Enter Chat'}
          </button>

          <button 
            type="button" 
            className="button secondaryButton"
            onClick={generateRandomName}
          >
            Random Name
          </button>
        </div>

        <div className="featuresList">
          <div className="featureItem">
            <span className="featureIcon">🌐</span> Join global chat room
          </div>
          <div className="featureItem">
            <span className="featureIcon">🔒</span> Private messaging
          </div>
          <div className="featureItem">
            <span className="featureIcon">🎨</span> Customize your profile
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;