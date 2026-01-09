const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

async function instagramStory(username) {
    try {
        const form = {
            'g-recaptcha-response': crypto.randomBytes(16).toString('hex'),
            text_username: username,
            user_data: ''
        };

        const data = await axios.post('https://www.storysaver.net/storyProcesst.php?c=1', 
            new URLSearchParams(form).toString(),
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'content-type': 'application/x-www-form-urlencoded',
                    origin: 'https://www.storysaver.net',
                    referer: 'https://www.storysaver.net/'
                }
            }
        );

        const $ = cheerio.load(data.data);
        const results = [];

        $('.stylestory').each(function () {
            const $el = $(this);
            const thumbnail = ($el.find('video').attr('poster') || $el.find('img').attr('src')) || '';
            const $a = $el.find('a');
            const url = $a.attr('href') || '';
            const type = /video/i.test($a.text()) ? 'video' : 'image';
            
            if (thumbnail && url) {
                results.push({
                    thumbnail,
                    url,
                    type
                });
            }
        });

        return {
            success: true,
            result: results,
            count: results.length,
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
    app.get("/download/igstory", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await instagramStory(username);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    count: result.count,
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mengambil story Instagram"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil story Instagram"
            });
        }
    });
};