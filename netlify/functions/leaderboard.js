import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const store = getStore('leaderboard');

  // Handle saving a new score (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const name = body.name || 'Satya';
      const score = parseInt(body.score, 10) || 0;
      const timestamp = Date.now();

      // Retrieve existing scores or start fresh
      let scores = (await store.get('scores', { type: 'json' })) || [];
      
      // Add new score, sort descending, and keep top 10
      scores.push({ name, score, timestamp });
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10);

      // Save back to Netlify Blobs
      await store.setJSON('scores', scores);

      return new Response(JSON.stringify({ success: true, scores }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  // Handle fetching the leaderboard (GET)
  if (req.method === 'GET') {
    const scores = (await store.get('scores', { type: 'json' })) || [];
    return new Response(JSON.stringify(scores), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
};