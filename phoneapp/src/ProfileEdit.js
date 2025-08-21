import React, { useState } from 'react';

export default function ProfileEdit({ token, userInfo, onUpdated }) {
  const [firstName, setFirstName] = useState(userInfo.first_name || '');
  const [lastName, setLastName] = useState(userInfo.last_name || '');
  const [email, setEmail] = useState(userInfo.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/users/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
      })
      .then((data) => {
        setSuccess('Profile updated!');
        setError('');
        if (onUpdated) onUpdated(data);
      })
      .catch((err) => {
        setError(err.message);
        setSuccess('');
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:20}}>
      <h4>Edit Profile</h4>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        style={{marginRight:10}}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        style={{marginRight:10}}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{marginRight:10}}
      />
      <button type="submit">Save</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
    </form>
  );
}
