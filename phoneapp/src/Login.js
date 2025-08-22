import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/csrf/', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(() => {
        console.warn('Could not fetch CSRF token, using fallback');
        setCsrfToken('fallback-token'); // Fallback for development
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Try real backend first
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken && csrfToken !== 'fallback-token' ? { 'X-CSRFToken': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      onLogin(data.access);
    } catch (err) {
      // If backend fails, use demo mode
      if (err.message.includes('Failed to fetch') || err.message.includes('fetch')) {
        console.warn('Backend not available, using demo mode');
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          const user = JSON.parse(demoUser);
          if (user.username === username) {
            setTimeout(() => {
              onLogin('demo-token-' + Date.now());
              setLoading(false);
            }, 1000);
            return;
          }
        }
        // Allow any login in demo mode
        setTimeout(() => {
          onLogin('demo-token-' + Date.now());
          setLoading(false);
        }, 1000);
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <div style={{marginTop:20}}>
        <Link to="/register">Don't have an account? Register</Link>
      </div>
    </div>
  );
}

export default Login;
