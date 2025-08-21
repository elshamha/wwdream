
import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (token) {
      fetch('http://127.0.0.1:8000/api/endpoint/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });

      // Fetch user info
      fetch('http://127.0.0.1:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch user info');
          return response.json();
        })
        .then((userData) => {
          setUsername(userData.username || '');
        })
        .catch(() => {
          setUsername('');
        });
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/"
          element={
            token ? (
              <div className="App">
                <header className="App-header">
                  <h1>PhoneApp Django API Integration</h1>
                  {username && (
                    <div style={{marginBottom:10}}>
                      <span>Logged in as <strong>{username}</strong></span>
                      <button style={{marginLeft:20}} onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                  {loading && <p>Loading...</p>}
                  {error && <p style={{color:'red'}}>Error: {error}</p>}
                  {data && (
                    <div style={{marginTop:20}}>
                      <strong>API Response:</strong>
                      <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                  )}
                </header>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
