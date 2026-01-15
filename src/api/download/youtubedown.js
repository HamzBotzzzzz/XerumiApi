const axios = require('axios');

async function youtubeDownload(url) {
    try {
        if (!url) throw new Error('URL YouTube diperlukan');
        
        const res = await axios.post('https://thesocialcat.com/api/youtube-download', {
            url: url,
            format: "1080p" 
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://thesocialcat.com/tools/youtube-video-downloader'
            }
        });

        const data = res.data;
        
        if (data.mediaUrl) {
            return {
                success: true,
                result: {
                    title: data.caption || 'YouTube Video',
                    resolution: data.format || 'HD',
                    url: data.mediaUrl,
                    thumbnail: data.thumbnail || null
                },
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error('Link download tidak ditemukan');
        }

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

module.exports = function(app) {
    app.get("/download/youtubedown", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await youtubeDownload(url);
            
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
                    message: result.message || "Gagal mendownload video YouTube"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video YouTube"
            });
        }
    });
};