import React, { useState } from 'react';

const MORE_AI_TOOLS = [
  { name: 'Auto-Completion', desc: 'Suggest next sentences or paragraphs.' },
  { name: 'Contextual Rewriting', desc: 'Rewrite text in different tones/styles.' },
  { name: 'Outline Generator', desc: 'Create document outlines from a topic.' },
  { name: 'Character/Plot Generator', desc: 'Generate character bios or plot ideas.' },
  { name: 'Fact-Checking', desc: 'Validate factual statements.' },
  { name: 'Citation Generator', desc: 'Generate citations for references.' },
  { name: 'Language Translation', desc: 'Translate text to/from other languages.' },
  { name: 'Voice-to-Text', desc: 'Convert spoken words to text.' },
  { name: 'Image-to-Text (OCR)', desc: 'Extract text from images.' },
  { name: 'AI-Powered Search', desc: 'Semantic document search.' },
  { name: 'Emotion Analysis', desc: 'Detect emotional tone.' },
  { name: 'Readability Scoring', desc: 'Rate text for readability.' }
];

export default function MoreAIFeaturesPanel() {
  const [input, setInput] = useState('');
  const [tool, setTool] = useState(MORE_AI_TOOLS[0].name);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulated AI feedback (replace with real API call)
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      await new Promise(r => setTimeout(r, 1200));
      let res = '';
      switch (tool) {
        case 'Auto-Completion':
          res = input + '\nNext: (AI suggests next sentence...)';
          break;
        case 'Contextual Rewriting':
          res = 'Rewritten (formal): ' + input.toUpperCase();
          break;
        case 'Outline Generator':
          res = 'Outline:\n1. Introduction\n2. Main Points\n3. Conclusion';
          break;
        case 'Character/Plot Generator':
          res = 'Character: Alex, a curious writer. Plot: Overcomes obstacles.';
          break;
        case 'Fact-Checking':
          res = 'Fact Check: No errors found.';
          break;
        case 'Citation Generator':
          res = 'Citation: Author, Title, Year.';
          break;
        case 'Language Translation':
          res = 'Translation: (Simulated)';
          break;
        case 'Voice-to-Text':
          res = 'Voice-to-Text: (Simulated)';
          break;
        case 'Image-to-Text (OCR)':
          res = 'OCR: (Simulated)';
          break;
        case 'AI-Powered Search':
          res = 'Search Results: (Simulated)';
          break;
        case 'Emotion Analysis':
          res = 'Emotion: Joy.';
          break;
        case 'Readability Scoring':
          res = 'Readability: Grade 8, Easy to read.';
          break;
        default:
          res = 'AI tool not implemented.';
      }
      setResult(res);
    } catch (e) {
      setError('AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>More AI Features</h4>
      <select value={tool} onChange={e => setTool(e.target.value)} style={{marginBottom:10}}>
        {MORE_AI_TOOLS.map(t => (
          <option key={t.name} value={t.name}>{t.name}</option>
        ))}
      </select>
      <div style={{fontSize:'0.95em',marginBottom:8}}>{MORE_AI_TOOLS.find(t => t.name === tool)?.desc}</div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your text here..."
        rows={5}
        style={{width:'100%',marginBottom:10}}
      />
      <button onClick={handleAnalyze} disabled={loading || !input} style={{marginBottom:10}}>
        {loading ? 'Processing...' : 'Run AI Tool'}
      </button>
      {error && <div style={{color:'var(--danger)',marginBottom:8}}>{error}</div>}
      {result && (
        <div style={{background:'#f4f6fa',borderRadius:8,padding:12,marginTop:8,whiteSpace:'pre-line'}}>
          {result}
        </div>
      )}
    </div>
  );
}
