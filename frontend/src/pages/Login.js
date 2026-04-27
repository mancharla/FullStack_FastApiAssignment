import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/doctors');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏥 Hospital Management</h2>
        <h3 style={styles.subtitle}>Login</h3>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: '100vh',
    background: '#f0f2f5'
  },
  card: {
    background: 'white', padding: '40px',
    borderRadius: '12px', width: '350px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  title: { textAlign: 'center', color: '#1a73e8', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: '20px' },
  input: {
    width: '100%', padding: '12px',
    marginBottom: '15px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '12px',
    background: '#1a73e8', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', cursor: 'pointer'
  },
  error: { color: 'red', textAlign: 'center', marginBottom: '10px' }
};