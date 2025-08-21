import React, { useState } from 'react';

export default function ChapterForm({ token, projectId, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/chapters/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        project: projectId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create chapter');
        return res.json();
      })
      .then((data) => {
        setTitle('');
        setContent('');
        setError('');
        if (onCreated) onCreated(data);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:20}}>
      <h4>Create New Chapter</h4>
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
      <button type="submit">Create</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
