import React, { useState } from 'react';

const TEMPLATES = [
  {
    name: 'Blank',
    content: ''
  },
  {
    name: 'Short Story',
    content: 'Title\n\nBy [Author]\n\n---\n\nOnce upon a time...'
  },
  {
    name: 'Essay',
    content: 'Title\n\nIntroduction\n\nBody Paragraphs\n\nConclusion'
  },
  {
    name: 'Poem',
    content: 'Title\n\n[First line]\n[Second line]\n[Third line]'
  },
  {
    name: 'Blog Post',
    content: 'Title\n\nIntroduction\n\nMain Content\n\nSummary/Call to Action'
  }
];

export default function DocumentTemplateSelector({ onSelect }) {
  const [selected, setSelected] = useState(TEMPLATES[0].name);

  function handleSelect(e) {
    setSelected(e.target.value);
    const template = TEMPLATES.find(t => t.name === e.target.value);
    if (template && onSelect) onSelect(template.content);
  }

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>Start from a Template</h4>
      <select value={selected} onChange={handleSelect} style={{marginBottom:10}}>
        {TEMPLATES.map(t => (
          <option key={t.name} value={t.name}>{t.name}</option>
        ))}
      </select>
      <div style={{background:'#f4f6fa',borderRadius:8,padding:12,minHeight:60,whiteSpace:'pre-line'}}>
        {TEMPLATES.find(t => t.name === selected)?.content || ''}
      </div>
    </div>
  );
}
