import React, { useEffect, useState } from 'react';

export default function AdvancedStats({ token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div style={{marginTop:20, marginBottom:20, padding:20, background:'#f4f6fa', borderRadius:8, boxShadow:'0 2px 8px #ccc'}}>
      <h4>Advanced Writing Stats</h4>
      <div>Word Count: <strong>{stats.wordCount}</strong></div>
      <div>Streak: <strong>{stats.streak}</strong> days</div>
      <div>Progress: <strong>{stats.progress}%</strong></div>
      {stats.avgSentenceLength && <div>Avg. Sentence Length: <strong>{stats.avgSentenceLength}</strong> words</div>}
      {stats.avgWordLength && <div>Avg. Word Length: <strong>{stats.avgWordLength}</strong> chars</div>}
      {stats.complexWords && <div>Complex Words: <strong>{stats.complexWords}%</strong></div>}
      {stats.readingTime && <div>Reading Time: <strong>{stats.readingTime} min</strong></div>}
      {stats.fleschScore && <div>Flesch Score: <strong>{stats.fleschScore}</strong></div>}
      <div style={{marginTop:10, height:10, background:'#e0e0e0', borderRadius:5}}>
        <div style={{width:`${stats.progress}%`, height:'100%', background:'#38ef7d', borderRadius:5}}></div>
      </div>
    </div>
  );
}
