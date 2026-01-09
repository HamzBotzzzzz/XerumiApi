const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSaveTwitter(tweetUrl) {
    try {
        const endpoint = 'https://savetwitter.net/api/ajaxSearch';

        const formData = new URLSearchParams();
        formData.append('q', tweetUrl);
        formData.append('lang', 'id');
        formData.append('cftoken', '');

        const headers = {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Referer': 'https://savetwitter.net/id'
        };

        const response = await axios.post(endpoint, formData.toString(), { headers });

        if (response.data.status !== 'ok') {
            throw new Error('API SaveTwitter mengembalikan status error');
        }

        const $ = cheerio.load(response.data.data);
        const results = [];

        $('.dl-action p').each((i, el) => {
            const anchor = $(el).find('a');
            const title = anchor.text().trim();
            const href = anchor.attr('href');
            
            if (href && href !== '#') {
                results.push({
                    type: title.includes('Gambar') ? 'image' : 'video',
                    quality: title.replace('Unduh ', ''),
                    url: href
                });
            } else if (anchor.hasClass('action-convert')) {
                results.push({
                    type: 'mp3_convert_info',
                    source_video: anchor.attr('data-audioUrl'),
                    media_id: anchor.attr('data-mediaId')
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
    app.get("/download/twitter2", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await scrapeSaveTwitter(url);
            
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