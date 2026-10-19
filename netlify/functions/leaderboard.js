import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const store = getStore('leaderboard');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const newEntry = { 
        name: body.name || 'Satya', 
        score: parseInt(body.score) || 0, 
        date: Date.now() 
      };

      let scores = [];
      const existing = await store.get('scores', { type: 'json' });
      if (existing && Array.isArray(existing)) scores = existing;

      scores.push(newEntry);
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10);

      await store.setJSON('scores', scores);

      return new Response(JSON.stringify({ success: true, scores }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers });
    }
  }

  try {
    const scores = (await store.get('scores', { type: 'json' })) || [];
    return new Response(JSON.stringify(scores), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify([]), { status: 200, headers });
  }
};