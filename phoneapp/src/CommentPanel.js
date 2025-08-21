import React, { useState, useEffect } from 'react';

export default function CommentPanel({ token, chapterId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/chapters/${chapterId}/comments/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setComments(data.results || data))
      .catch(() => setComments([]));
  }, [chapterId, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/chapters/${chapterId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add comment');
        return res.json();
      })
      .then((data) => {
        setNewComment('');
        setError('');
        setComments((prev) => [...prev, data]);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{marginTop:20}}>
      <h4>Comments</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{marginRight:10}}
        />
        <button type="submit">Send</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
      <ul style={{marginTop:10}}>
        {comments.map((c, idx) => (
          <li key={c.id || idx}><strong>{c.author || 'User'}:</strong> {c.content}</li>
        ))}
      </ul>
    </div>
  );
}
