const crypto = require('crypto');
const axios = require('axios');

const k = {
  "enc": "GJvE5RZIxrl9SuNrAtgsvCfWha3M7NGC",
  "dec": "H3quWdWoHLX5bZSlyCYAnvDFara25FIu"
}

const cryptoProc = (type, data) => {
    const key = Buffer.from(k[type]);
    const iv = Buffer.from(k[type].slice(0, 16));
    const cipher = (type === 'enc' ? crypto.createCipheriv : crypto.createDecipheriv)('aes-256-cbc', key, iv);
    let rchipher = cipher.update(data, ...(type === 'enc' ? ['utf8', 'base64'] : ['base64', 'utf8']));
    rchipher += cipher.final(type === 'enc' ? 'base64' : 'utf8');
    return rchipher;
};

async function tiktokDl(url) {
    try {
        if (!/tiktok\.com/.test(url)) throw new Error('Invalid url.');
        
        const { data } = await axios.post('https://savetik.app/requests', {
            bdata: cryptoProc('enc', url)
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Android 16; Mobile; SM-D639N; rv:130.0) Gecko/130.0 Firefox/130.0',
                'Content-Type': 'application/json'
            }
        });
        
        if (!data || data.status !== 'success') throw new Error('Fetch failed.');

        const result = {
            author: data.username,
            thumbnail: data.thumbnailUrl,
            video: cryptoProc('dec', data.data),
            audio: data.mp3
        };

        return {
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = function(app) {
    app.get("/download/tiktok2", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await tiktokDl(url);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mendownload video TikTok"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video TikTok"
            });
        }
    });
};