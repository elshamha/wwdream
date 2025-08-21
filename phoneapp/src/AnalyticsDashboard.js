import React, { useEffect, useState } from 'react';

export default function AnalyticsDashboard({ token }) {
  const [stats, setStats] = useState({ wordCount: 0, documents: 0, deadlines: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Example endpoints, adjust as needed
        const docRes = await fetch('http://127.0.0.1:8000/api/documents/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const docs = await docRes.json();
        const documents = docs.results ? docs.results.length : docs.length || 0;
        const wordCount = docs.results ? docs.results.reduce((sum, d) => sum + (d.word_count || 0), 0) : 0;

        const remRes = await fetch('http://127.0.0.1:8000/api/reminders/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reminders = await remRes.json();
        const deadlines = reminders.results ? reminders.results.length : reminders.length || 0;

        setStats({ wordCount, documents, deadlines });
      } catch {
        setStats({ wordCount: 0, documents: 0, deadlines: 0 });
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <div style={{marginTop:20, marginBottom:20, padding:20, background:'#eaf6ff', borderRadius:8, boxShadow:'0 2px 8px #cce'}}>
      <h4>Analytics Dashboard</h4>
      {loading ? <div>Loading...</div> : (
        <ul style={{fontSize:'1.1em'}}>
          <li><strong>Total Documents:</strong> {stats.documents}</li>
          <li><strong>Total Word Count:</strong> {stats.wordCount}</li>
          <li><strong>Active Deadlines:</strong> {stats.deadlines}</li>
        </ul>
      )}
    </div>
  );
}
