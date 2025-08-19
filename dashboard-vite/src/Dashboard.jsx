import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [documents] = useState([
    { id: '1', title: 'Demo Document 1', content: 'This is the first demo document.' }
  ]);
  const [editorContent, setEditorContent] = useState(documents[0].content);

  // No dropdown, always show first document

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#1976d2' }}>Writer's Web Dream Dashboard</h1>
      {/* Removed document selection dropdown */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #1976d222', minHeight: 200 }}>
        <h2 style={{ color: '#1976d2' }}>Editor</h2>
        <textarea
          value={editorContent}
          onChange={e => setEditorContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: 120,
            borderRadius: 8,
            border: '1px solid #90caf9',
            padding: 12,
            fontSize: 16,
            background: '#f8fafc',
            color: '#213547',
            boxShadow: '0 1px 4px #1976d222'
          }}
          placeholder="Start writing here..."
        />
      </div>
    </div>
  );
}
