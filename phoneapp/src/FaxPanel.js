import React, { useState } from 'react';

export default function FaxPanel({ token }) {
  const [recipient, setRecipient] = useState('');
  const [document, setDocument] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendFax = async () => {
    setLoading(true);
    setStatus('');
    // Simulate fax sending (replace with real API integration)
    await new Promise(r => setTimeout(r, 1500));
    setStatus('Fax sent successfully to ' + recipient + '!');
    setLoading(false);
  };

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>Send a Fax</h4>
      <input
        type="text"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        placeholder="Recipient Fax Number"
        style={{width:'100%',marginBottom:10}}
      />
      <textarea
        value={document}
        onChange={e => setDocument(e.target.value)}
        placeholder="Paste your document here..."
        rows={5}
        style={{width:'100%',marginBottom:10}}
      />
      <button onClick={handleSendFax} disabled={loading || !recipient || !document} style={{marginBottom:10}}>
        {loading ? 'Sending...' : 'Send Fax'}
      </button>
      {status && <div style={{color:'var(--accent)',marginTop:8}}>{status}</div>}
    </div>
  );
}
