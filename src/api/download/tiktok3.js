const axios = require('axios');
const qs = require('qs');

async function aioDownloader(targetUrl) {
    try {
        if (!targetUrl) throw new Error('URL diperlukan');
        
        const apiUrl = 'https://tikvideo.app/api/ajaxSearch';
        const response = await axios.post(apiUrl, qs.stringify({
            q: targetUrl,
            lang: 'en'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://tikvideo.app/'
            }
        });

        const res = response.data;

        if (res.status !== 'ok') {
            throw new Error('API gagal merespon');
        }

        const links = res.data.match(/href="([^"]+)"/g);
        const titleMatch = res.data.match(/<h3>([^<]+)<\/h3>/);
        
        if (!links) throw new Error('Link download tidak ditemukan');

        const cleanLink = links[0].replace('href="', '').replace('"', '');
        const title = titleMatch ? titleMatch[1] : 'video_aio';

        return {
            success: true,
            result: {
                title: title,
                url: cleanLink
            },
            timestamp: new Date().toISOString()
        };

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

module.exports = function(app) {
    app.get("/download/tiktok3", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await aioDownloader(url);
            
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
                    message: result.message || "Gagal mendownload video"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video"
            });
        }
    });
};