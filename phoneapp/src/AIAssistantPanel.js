import React, { useState } from 'react';
import { callOpenAI } from './openai';

export default function AIAssistantPanel() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const prompt = `Please check grammar, style, and summarize the following text:\n${input}`;
      const aiResult = await callOpenAI({ prompt, apiKey });
      setResult(aiResult);
    } catch (e) {
      setError('AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>AI Writing Assistant</h4>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API key"
        style={{width:'100%',marginBottom:10}}
      />
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your text here..."
        rows={5}
        style={{width:'100%',marginBottom:10}}
      />
      <button onClick={handleAnalyze} disabled={loading || !input || !apiKey} style={{marginBottom:10}}>
        {loading ? 'Analyzing...' : 'Analyze Text'}
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
