const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeX2Twitter(tweetUrl) {
    try {
        const endpoint = 'https://x2twitter.com/api/ajaxSearch';

        const formData = new URLSearchParams();
        formData.append('q', tweetUrl);
        formData.append('lang', 'id');
        formData.append('cftoken', '');

        const headers = {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Referer': 'https://x2twitter.com/id'
        };

        const response = await axios.post(endpoint, formData.toString(), { headers });

        if (response.data.status !== 'ok') {
            throw new Error(`API Error: ${response.data.status}`);
        }

        const $ = cheerio.load(response.data.data);
        const results = [];

        $('.dl-action p').each((i, el) => {
            const a = $(el).find('a');
            const link = a.attr('href');
            const text = a.text().trim();

            if (link && link !== '#') {
                results.push({
                    type: text.toLowerCase().includes('gambar') ? 'image' : 'video',
                    label: text,
                    url: link
                });
            } else if (a.hasClass('action-convert')) {
                results.push({
                    type: 'mp3_convert',
                    video_url: a.attr('data-audioUrl'),
                    media_id: a.attr('data-mediaId')
                });
            }
        });

        const metadata = {
            title: $('.tw-middle h3').text().trim(),
            duration: $('.tw-middle p').first().text().trim(),
            thumbnail: $('.thumbnail img').attr('src')
        };

        return {
            success: true,
            result: {
                metadata: metadata,
                downloads: results
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
    app.get("/download/twitter3", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await scrapeX2Twitter(url);
            
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