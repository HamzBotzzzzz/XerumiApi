const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSssTwitter(tweetUrl) {
    try {
        const endpoint = 'https://ssstwitter.com/id';
        
        const formData = new URLSearchParams();
        formData.append('id', tweetUrl);
        formData.append('locale', 'id');
        formData.append('tt', 'ab0f020a42a8adefa1245ce07cbcb421');
        formData.append('ts', Math.floor(Date.now() / 1000));
        formData.append('source', 'form');

        const headers = {
            'HX-Request': 'true',
            'HX-Target': 'target',
            'HX-Current-URL': 'https://ssstwitter.com/id',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        };

        const response = await axios.post(endpoint, formData.toString(), { headers });
        const $ = cheerio.load(response.data);
        
        const downloadLink = $('.download_link.quality-best').attr('data-directurl');

        if (!downloadLink) {
            throw new Error('Gagal mendapatkan link download');
        }

        return {
            success: true,
            result: {
                url: downloadLink,
                text: $('.quality-best span').text().trim() || 'Download Original Video'
            },
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
    app.get("/download/twitter", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await scrapeSssTwitter(url);
            
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