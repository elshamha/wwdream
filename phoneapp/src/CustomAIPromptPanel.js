import React, { useState } from 'react';

export default function CustomAIPromptPanel() {
  const [prompt, setPrompt] = useState('');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulated AI response (replace with real API call)
  const handleRun = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      await new Promise(r => setTimeout(r, 1200));
      setResult(`Prompt: ${prompt}\nInput: ${input}\n\nAI Response: (Simulated result)`);
    } catch (e) {
      setError('AI prompt failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>Custom AI Prompt</h4>
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter your AI prompt (e.g. 'Summarize this text')"
        style={{width:'100%',marginBottom:10}}
      />
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your text here..."
        rows={5}
        style={{width:'100%',marginBottom:10}}
      />
      <button onClick={handleRun} disabled={loading || !prompt || !input} style={{marginBottom:10}}>
        {loading ? 'Processing...' : 'Run Custom AI'}
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
