import React, { useEffect, useState } from 'react';

export default function ProgressTracker({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, [token]);

  if (!stats) return null;

  return (
    <div style={{marginTop:20, marginBottom:20, padding:20, background:'#f4f6fa', borderRadius:8, boxShadow:'0 2px 8px #ccc'}}>
      <h4>Progress Tracking</h4>
      <div>Word Count: <strong>{stats.wordCount}</strong></div>
      <div>Streak: <strong>{stats.streak}</strong> days</div>
      <div>Progress: <strong>{stats.progress}%</strong></div>
      <div style={{marginTop:10, height:10, background:'#e0e0e0', borderRadius:5}}>
        <div style={{width:`${stats.progress}%`, height:'100%', background:'#38ef7d', borderRadius:5}}></div>
      </div>
    </div>
  );
}
