const axios = require('axios');
const cheerio = require('cheerio');

async function hentaividScraper() {
    try {
        // Random page sampai 1153 sesuai script asli lu
        const page = Math.floor(Math.random() * 1153) + 1;
        const targetUrl = `https://sfmcompile.club/page/${page}`;
        
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('#primary > div > div > ul > li > article').each(function (a, b) {
            const videoUrl = $(b).find('source').attr('src') || $(b).find('video > a').attr('href') || $(b).find('img').attr('data-src');
            
            if (videoUrl) {
                results.push({
                    title: $(b).find('header > h2').text().trim(),
                    link: $(b).find('header > h2 > a').attr('href'),
                    category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', '').trim(),
                    share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text().trim(),
                    views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text().trim(),
                    type: $(b).find('source').attr('type') || 'video/mp4',
                    video: videoUrl
                });
            }
        });

        if (results.length === 0) throw new Error('Konten tidak ditemukan');

        // Balikin 10 video random dari hasil scrape page tersebut
        return {
            success: true,
            result: results.sort(() => 0.5 - Math.random()).slice(0, 10)
        };

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

module.exports = function(app) {
    app.get("/random/hentaivid", async (req, res) => {
        try {
            const result = await hentaividScraper();
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxxx",
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "HamzBotzzzzz",
                    message: result.message || "Gagal mengambil konten SFM"
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
