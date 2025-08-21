import React, { useState } from 'react';

export default function ProjectForm({ token, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [targetWordCount, setTargetWordCount] = useState(50000);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/projects/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        genre,
        target_word_count: targetWordCount,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
      })
      .then((data) => {
        setTitle('');
        setDescription('');
        setGenre('');
        setTargetWordCount(50000);
        setError('');
        if (onCreated) onCreated(data);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:20}}>
      <h4>Create New Project</h4>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{marginRight:10}}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{marginRight:10}}
      />
      <input
        type="text"
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        style={{marginRight:10}}
      />
      <input
        type="number"
        placeholder="Target Word Count"
        value={targetWordCount}
        onChange={(e) => setTargetWordCount(e.target.value)}
        style={{marginRight:10, width:120}}
      />
      <button type="submit">Create</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
