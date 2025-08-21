import React, { useState, useEffect } from 'react';

export default function Reminders({ token }) {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/reminders/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setReminders(data.results || data))
      .catch(() => setReminders([]));
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/reminders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: newReminder, deadline }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add reminder');
        return res.json();
      })
      .then((data) => {
        setNewReminder('');
        setDeadline('');
        setError('');
        setReminders((prev) => [...prev, data]);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{marginTop:20, marginBottom:20, padding:20, background:'#f4f6fa', borderRadius:8, boxShadow:'0 2px 8px #ccc'}}>
      <h4>Reminders & Deadlines</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Reminder text"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          style={{marginRight:10}}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{marginRight:10}}
        />
        <button type="submit">Add</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
      <ul style={{marginTop:10}}>
        {reminders.map((r, idx) => (
          <li key={r.id || idx}>
            <strong>{r.text}</strong> {r.deadline && (<span>- Due: {r.deadline}</span>)}
          </li>
        ))}
      </ul>
    </div>
  );
}
