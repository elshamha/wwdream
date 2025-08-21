import React, { useEffect, useState } from 'react';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new window.WebSocket('ws://127.0.0.1:8000/ws/notifications/');
    setWs(socket);
    socket.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.message) {
        setNotifications((prev) => [...prev, data.message]);
      }
    };
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{marginTop:30, marginBottom:30, padding:20, background:'#f8fafc', borderRadius:8, boxShadow:'0 2px 8px #ccc'}}>
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <div>No notifications yet.</div>
      ) : (
        <ul>
          {notifications.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
