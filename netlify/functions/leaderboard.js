export default async (req, context) => {
  // Use Netlify's built-in global blobs store (No npm install required!)
  const store = Netlify.blobs.getStore('leaderboard');

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const newEntry = { name: body.name || 'Satya', score: body.score || 0, date: Date.now() };

      // Fetch existing scores
      let scores = [];
      const existing = await store.get('scores', { type: 'json' });
      if (existing) scores = existing;

      // Add new score, sort descending, and keep top 10
      scores.push(newEntry);
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10);

      // Save back to Netlify Blobs
      await store.setJSON('scores', scores);

      return new Response(JSON.stringify({ success: true, scores }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // GET request: Return current leaderboard
  try {
    const scores = (await store.get('scores', { type: 'json' })) || [];
    return new Response(JSON.stringify(scores), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};