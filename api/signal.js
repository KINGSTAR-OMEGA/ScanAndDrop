const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, sdp, candidate, room } = req.body;
    
    try {
        await kv.set(`signal:${room}:${type}`, { sdp, candidate }, { ex: 300 });
        
        if (type === 'answer') {
            await kv.set(`answer:${room}`, { sdp }, { ex: 300 });
        }
        
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
