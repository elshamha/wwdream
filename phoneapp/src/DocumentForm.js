import React, { useState, useEffect, useRef } from 'react';
import { exportEPUB } from './exportEPUB';

export default function DocumentForm({ token, projects, onCreated, initialContent }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent || '');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const saveTimeout = useRef(null);

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('documentDraft');
    if (draft) {
      try {
        const { title: t, content: c, projectId: p } = JSON.parse(draft);
        setTitle(t || '');
        setContent(c || '');
        setProjectId(p || '');
        setSaveStatus('Recovered unsaved draft.');
      } catch {}
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem('documentDraft', JSON.stringify({ title, content, projectId }));
      setSaveStatus('Draft auto-saved.');
    }, 1500);
    return () => clearTimeout(saveTimeout.current);
  }, [title, content, projectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    fetch('http://127.0.0.1:8000/api/documents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        project: projectId || null,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create document');
        return res.json();
      })
      .then((data) => {
        setTitle('');
        setContent('');
        setProjectId('');
        setError('');
        setSaveStatus('');
        setSuccess('Document created successfully!');
        localStorage.removeItem('documentDraft');
        if (onCreated) onCreated(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Export/download helpers
  function downloadFile(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportTXT() {
    downloadFile((title || 'document') + '.txt', content);
  }
  function handleExportMD() {
    downloadFile((title || 'document') + '.md', `# ${title}\n\n${content}`);
  }

  function handleExportEPUB() {
    setLoading(true);
    setError('');
    setSuccess('');
    fetch('http://127.0.0.1:8000/api/documents/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((docs) => {
        const doc = docs.find(d => d.title === title);
        if (!doc) {
          setError('Please save the document first, or select an existing document to export.');
          setLoading(false);
          return;
        }
        exportEPUB(doc.id, token);
        setSuccess('EPUB export started!');
      })
      .catch(() => setError('Failed to export EPUB.'))
      .finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:20}}>
      <h4>Create New Document</h4>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{marginRight:10}}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{marginRight:10, verticalAlign:'top', width:200, height:60}}
      />
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        style={{marginRight:10}}
      >
        <option value="">No Project</option>
        {projects.map((proj) => (
          <option key={proj.id} value={proj.id}>{proj.title}</option>
        ))}
      </select>
      <button type="submit">Create</button>
  <button type="button" onClick={handleExportTXT} style={{marginLeft:10,background:'var(--primary)',color:'#fff'}}>Export TXT</button>
  <button type="button" onClick={handleExportMD} style={{marginLeft:10,background:'var(--primary)',color:'#fff'}}>Export MD</button>
  <button type="button" onClick={handleExportEPUB} style={{marginLeft:10,background:'purple',color:'#fff'}}>Export EPUB</button>
  {loading && <div style={{color:'var(--primary)',fontWeight:600,marginTop:6}}>Loading...</div>}
  {saveStatus && <div style={{color:'var(--accent)',fontSize:'0.95em',marginTop:6}}>{saveStatus}</div>}
  {success && <div style={{color:'green',fontWeight:600,marginTop:6}}>{success}</div>}
  {error && <div style={{color:'red',fontWeight:600,marginTop:6}}>{error}</div>}
    </form>
  );
}
