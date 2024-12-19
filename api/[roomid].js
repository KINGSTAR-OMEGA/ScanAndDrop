const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    const { roomId } = req.query;
    
    try {
        const roomExists = await kv.get(`room:${roomId}`);
        
        if (!roomExists) {
            await kv.set(`room:${roomId}`, true, { ex: 300 });
            return res.json({ isFirst: true });
        }
        
        return res.json({ isFirst: false });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
