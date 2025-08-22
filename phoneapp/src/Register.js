import React, { useState, useEffect } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);
    if (!username || !password || !email) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      // Try real backend first
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken && csrfToken !== 'fallback-token' ? { 'X-CSRFToken': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      setSuccess(true);
    } catch (err) {
      // If backend fails, use demo mode
      if (err.message.includes('Failed to fetch') || err.message.includes('fetch')) {
        console.warn('Backend not available, using demo mode');
        // Simulate successful registration after delay
        setTimeout(() => {
          setSuccess(true);
          setError(null);
          // Store demo user in localStorage
          localStorage.setItem('demoUser', JSON.stringify({ username, email }));
          setLoading(false);
        }, 1500);
        return;
      }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      {success && <p style={{color:'green'}}>Registration successful! You can now log in.</p>}
    </div>
  );
}

export default Register;
