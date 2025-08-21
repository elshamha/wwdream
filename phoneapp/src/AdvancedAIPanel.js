import React, { useState } from 'react';

const AI_TOOLS = [
  { name: 'Grammar Check', desc: 'Find and fix grammar errors.' },
  { name: 'Style Suggestions', desc: 'Improve clarity and style.' },
  { name: 'Summarize', desc: 'Generate a concise summary.' },
  { name: 'Paraphrase', desc: 'Rewrite text for variety.' },
  { name: 'Expand', desc: 'Add detail and depth.' },
  { name: 'Shorten', desc: 'Make text more concise.' },
  { name: 'Continue Writing', desc: 'Suggest next sentences.' },
  { name: 'Headline Generator', desc: 'Create a catchy title.' },
  { name: 'Tone Analysis', desc: 'Detect tone (formal, casual, etc).' },
  { name: 'Plagiarism Check', desc: 'Check for copied content.' }
];

export default function AdvancedAIPanel() {
  const [input, setInput] = useState('');
  const [tool, setTool] = useState(AI_TOOLS[0].name);
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
        case 'Grammar Check':
          res = 'No major grammar errors found.';
          break;
        case 'Style Suggestions':
          res = 'Style: Clear, concise. Consider varying sentence length.';
          break;
        case 'Summarize':
          res = 'Summary: ' + (input.length > 60 ? input.slice(0, 60) + '...' : input);
          break;
        case 'Paraphrase':
          res = 'Paraphrased: ' + input.split(' ').reverse().join(' ');
          break;
        case 'Expand':
          res = 'Expanded: ' + input + ' (Add more detail here.)';
          break;
        case 'Shorten':
          res = 'Shortened: ' + (input.length > 30 ? input.slice(0, 30) + '...' : input);
          break;
        case 'Continue Writing':
          res = input + '\nNext: (AI suggests next sentence...)';
          break;
        case 'Headline Generator':
          res = 'Headline: "A New Perspective on Writing"';
          break;
        case 'Tone Analysis':
          res = 'Tone: Neutral, formal.';
          break;
        case 'Plagiarism Check':
          res = 'Plagiarism: No matches found.';
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
      <h4>Advanced AI Writing Tools</h4>
      <select value={tool} onChange={e => setTool(e.target.value)} style={{marginBottom:10}}>
        {AI_TOOLS.map(t => (
          <option key={t.name} value={t.name}>{t.name}</option>
        ))}
      </select>
      <div style={{fontSize:'0.95em',marginBottom:8}}>{AI_TOOLS.find(t => t.name === tool)?.desc}</div>
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
