const axios = require('axios');
const cheerio = require('cheerio');

async function xnxxScraper() {
    try {
        // Ambil dari halaman best secara random (page 1-5)
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const targetUrl = `https://www.xnxx.com/best/${randomPage}`;
        
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.xnxx.com/'
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        $('.thumb-block').each((i, el) => {
            if (i < 10) { // Batasi 10 video sesuai request
                const title = $(el).find('.thumb-under a').attr('title');
                const videoPath = $(el).find('.thumb-under a').attr('href');
                const thumb = $(el).find('.thumb img').attr('data-src') || $(el).find('.thumb img').attr('src');
                const duration = $(el).find('.duration').text().trim();

                if (videoPath && !videoPath.includes('/ads/')) {
                    results.push({
                        title: title || 'No Title',
                        duration: duration || 'N/A',
                        thumb: thumb,
                        url: 'https://www.xnxx.com' + videoPath
                    });
                }
            }
        });

        if (results.length === 0) throw new Error('Video tidak ditemukan');

        return {
            success: true,
            result: results
        };

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

module.exports = function(app) {
    app.get("/random/xnxx", async (req, res) => {
        try {
            const result = await xnxxScraper();
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx", // Sesuaikan creator lu bos
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "HamzBotzzzzz",
                    message: result.message || "Gagal mengambil data XNXX"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "HamzBotzzzzz",
                message: "Internal Server Error"
            });
        }
    });
};
