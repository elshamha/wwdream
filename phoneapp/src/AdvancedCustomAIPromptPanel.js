import React, { useState } from 'react';
import { callOpenAI } from './openai';

const PRESETS = [
  { name: 'Summarize', prompt: 'Summarize the following text:' },
  { name: 'Rewrite', prompt: 'Rewrite the following text for clarity:' },
  { name: 'Grammar Check', prompt: 'Check grammar and suggest corrections:' },
  { name: 'Expand', prompt: 'Expand the following text with more detail:' },
  { name: 'Shorten', prompt: 'Make the following text more concise:' },
  { name: 'Analyze Tone', prompt: 'Analyze the tone of the following text:' },
  { name: 'Generate Headline', prompt: 'Generate a headline for the following text:' }
];

export default function AdvancedCustomAIPromptPanel() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [system, setSystem] = useState('');
  const [prompt, setPrompt] = useState('');
  const [input, setInput] = useState('');
  const [maxTokens, setMaxTokens] = useState(512);
  const [temperature, setTemperature] = useState(0.7);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handlePreset(e) {
    setPrompt(PRESETS.find(p => p.name === e.target.value)?.prompt || '');
  }

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const fullPrompt = `${prompt}\n${input}`;
      const aiResult = await callOpenAI({ prompt: fullPrompt, apiKey, model, system, max_tokens: maxTokens, temperature });
      setResult(aiResult);
    } catch (e) {
      setError('AI prompt failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{marginTop:20}}>
      <h4>Advanced Custom AI Prompt</h4>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="OpenAI API key"
        style={{width:'100%',marginBottom:10}}
      />
      <div style={{display:'flex',gap:10,marginBottom:10}}>
        <select onChange={handlePreset} style={{flex:1}} defaultValue="">
          <option value="">Choose a preset...</option>
          {PRESETS.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select value={model} onChange={e => setModel(e.target.value)} style={{flex:1}}>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </select>
      </div>
      <input
        type="text"
        value={system}
        onChange={e => setSystem(e.target.value)}
        placeholder="System message (optional, e.g. 'You are a helpful assistant')"
        style={{width:'100%',marginBottom:10}}
      />
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Prompt (e.g. 'Summarize the following text:')"
        style={{width:'100%',marginBottom:10}}
      />
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your text here..."
        rows={5}
        style={{width:'100%',marginBottom:10}}
      />
      <div style={{display:'flex',gap:10,marginBottom:10}}>
        <input
          type="number"
          value={maxTokens}
          onChange={e => setMaxTokens(Number(e.target.value))}
          min={64}
          max={2048}
          style={{flex:1}}
          placeholder="Max tokens"
        />
        <input
          type="number"
          value={temperature}
          onChange={e => setTemperature(Number(e.target.value))}
          min={0}
          max={1}
          step={0.1}
          style={{flex:1}}
          placeholder="Temperature"
        />
      </div>
      <button onClick={handleRun} disabled={loading || !apiKey || !prompt || !input} style={{marginBottom:10}}>
        {loading ? 'Processing...' : 'Run AI'}
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
