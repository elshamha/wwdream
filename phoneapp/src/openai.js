// Usage: import { callOpenAI } from './openai';
// callOpenAI({ prompt, apiKey, model })

export async function callOpenAI({ prompt, apiKey, model = 'gpt-3.5-turbo', system = '', max_tokens = 512 }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });
  const body = JSON.stringify({
    model,
    messages,
    max_tokens
  });
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
