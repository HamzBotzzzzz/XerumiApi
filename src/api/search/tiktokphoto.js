const axios = require('axios');

async function tiktokPhoto(query, counts) {
    try {
        const payload = {
            keywords: query,
            count: counts,
            cursor: 0,
            web: 1,
            hd: 1
        };

        const URI = 'https://tikwm.com/api/photo/search';
        const { data } = await axios.post(URI, payload);

        return data.data.videos;
    } catch (error) {
        throw new Error(`Failed to fetch TikTok photos: ${error.message}`);
    }
}

module.exports = function(app) {
    app.get("/search/tiktokphoto", async (req, res) => {
        const { query, count } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const resultCount = count ? parseInt(count) : 10;
            const result = await tiktokPhoto(query, resultCount);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari foto TikTok"
            });
        }
    });
};