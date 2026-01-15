const axios = require('axios');

async function scrapeMenarailPost(tweetUrl) {
    try {
        const endpoint = 'https://api-v1.menarailpost.com/v1/info';

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Origin': 'https://menarailpost.com',
            'Referer': 'https://menarailpost.com/'
        };

        const body = {
            url: tweetUrl
        };

        const response = await axios.post(endpoint, body, { headers });
        const data = response.data;

        const downloads = data.formats.map(fmt => ({
            quality: fmt.resolution,
            ext: fmt.video_ext !== 'none' ? fmt.video_ext : fmt.audio_ext,
            download_url: fmt.url,
            is_audio: fmt.resolution === 'audio only'
        }));

        return {
            success: true,
            result: {
                metadata: {
                    title: data.title,
                    description: data.description,
                    duration: data.duration,
                    thumbnail: data.thumbnail
                },
                downloads: downloads
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return {
            success: false,
            message: error.response ? error.response.data : error.message
        };
    }
}

module.exports = function(app) {
    app.get("/download/twitter4", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await scrapeMenarailPost(url);
            
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
                    message: result.message || "Gagal mendownload video Twitter"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video Twitter"
            });
        }
    });
};