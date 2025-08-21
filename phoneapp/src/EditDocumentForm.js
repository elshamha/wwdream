import React, { useState } from 'react';
export default function EditDocumentForm({ document, projects, onUpdate, onCancel }) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [projectId, setProjectId] = useState(document.project || '');
  return (
    <form onSubmit={e => {e.preventDefault(); onUpdate({ ...document, title, content, project: projectId });}} style={{marginBottom:10}}>
      <h4>Edit Document</h4>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{marginRight:10}} />
      <textarea value={content} onChange={e => setContent(e.target.value)} style={{marginRight:10, verticalAlign:'top', width:200, height:60}} />
      <select value={projectId} onChange={e => setProjectId(e.target.value)} style={{marginRight:10}}>
        <option value="">No Project</option>
        {projects.map((proj) => (
          <option key={proj.id} value={proj.id}>{proj.title}</option>
        ))}
      </select>
      <button type="submit">Update</button>
      <button type="button" onClick={onCancel} style={{marginLeft:10}}>Cancel</button>
    </form>
  );
}
