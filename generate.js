// Vercel serverless function: proxies requests to the Anthropic API.
// The API key stays on the server (ANTHROPIC_API_KEY env var), never in the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
  if (prompt.length < 5 || prompt.length > 12000) {
    return res.status(400).json({ error: 'Prompt must be between 5 and 12000 characters' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID } : {}),
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (r.status === 429) return res.status(429).json({ error: 'Rate limited' });
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.json())?.error?.message || ''; } catch (e) {}
      console.error('Anthropic error', r.status, detail);
      return res.status(502).json({ error: `Anthropic API error (${r.status}): ${detail}` });
    }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Server could not reach the Anthropic API' });
  }
}
