import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedType, setSelectedType] = useState('document');
  const [selectedId, setSelectedId] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/documents/')
      .then(res => res.json())
      .then(data => setDocuments(data));
    fetch('http://127.0.0.1:8000/api/chapters/')
      .then(res => res.json())
      .then(data => setChapters(data));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const url = selectedType === 'document'
      ? `http://127.0.0.1:8000/api/documents/${selectedId}/`
      : `http://127.0.0.1:8000/api/chapters/${selectedId}/`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setEditorContent(data.content || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedType, selectedId]);

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#1976d2' }}>Writer's Web Dream Dashboard</h1>
      <div style={{ marginBottom: 24 }}>
        <label style={{ marginRight: 12 }}>
          Select Type:
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="document">Document</option>
            <option value="chapter">Chapter</option>
          </select>
        </label>
        <label style={{ marginLeft: 24 }}>
          Select {selectedType === 'document' ? 'Document' : 'Chapter'}:
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">-- Select --</option>
            {(selectedType === 'document' ? documents : chapters).map(item => (
              <option key={item.id} value={item.id}>{item.title || `Untitled ${selectedType}`}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #1976d222', minHeight: 200 }}>
        <h2 style={{ color: '#1976d2' }}>Editor</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <textarea
            value={editorContent}
            onChange={e => setEditorContent(e.target.value)}
            style={{ width: '100%', minHeight: 120, borderRadius: 8, border: '1px solid #90caf9', padding: 12, fontSize: 16 }}
            placeholder="Start writing here..."
          />
        )}
      </div>
    </div>
  );
}
