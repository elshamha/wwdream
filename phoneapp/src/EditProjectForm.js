import React, { useState } from 'react';
export default function EditProjectForm({ project, onUpdate, onCancel }) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [genre, setGenre] = useState(project.genre || '');
  const [targetWordCount, setTargetWordCount] = useState(project.target_word_count || 50000);
  return (
    <form onSubmit={e => {e.preventDefault(); onUpdate({ ...project, title, description, genre, target_word_count: targetWordCount });}} style={{marginBottom:10}}>
      <h4>Edit Project</h4>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{marginRight:10}} />
      <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={{marginRight:10}} />
      <input type="text" value={genre} onChange={e => setGenre(e.target.value)} style={{marginRight:10}} />
      <input type="number" value={targetWordCount} onChange={e => setTargetWordCount(e.target.value)} style={{marginRight:10, width:120}} />
      <button type="submit">Update</button>
      <button type="button" onClick={onCancel} style={{marginLeft:10}}>Cancel</button>
    </form>
  );
}
