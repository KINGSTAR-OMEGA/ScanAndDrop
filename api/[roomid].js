// api/check-room/[roomId].js
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  const { roomId } = req.query;
  
  try {
    // Check if room exists in Vercel KV storage
    const roomExists = await kv.get(`room:${roomId}`);
    
    if (!roomExists) {
      // First peer - set room as existing with 5 minute expiry
      await kv.set(`room:${roomId}`, true, { ex: 300 });
      return res.json({ isFirst: true });
    }
    
    return res.json({ isFirst: false });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// api/signal.js
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, sdp, candidate, room } = req.body;
  
  try {
    // Store signaling data with 5 minute expiry
    await kv.set(`signal:${room}:${type}`, { sdp, candidate }, { ex: 300 });
    
    // If this is an answer, also store it separately
    if (type === 'answer') {
      await kv.set(`answer:${room}`, { sdp }, { ex: 300 });
    }
    
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};