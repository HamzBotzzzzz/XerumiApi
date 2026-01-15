const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi Scraper Internal
const nekopoi = {
    getLatest: async () => {
        try {
            const { data } = await axios.get('https://nekopoi.care', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);
            const results = [];

            $('div.eropost').each((i, e) => {
                const title = $(e).find('h2 a').text().trim();
                const link = $(e).find('h2 a').attr('href');
                const image = $(e).find('img').attr('src');
                if (title) results.push({ title, image, link });
            });

            if (results.length === 0) throw new Error('Gak ada hasil, Nekopoi lagi tepar mungkin.');
            
            // Ambil 1 random biar seru kayak script aslinya
            return { success: true, result: results[Math.floor(Math.random() * results.length)] };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    getVideo: async (url) => {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);
            const links = [];
            const title = $("title").text().replace(' - Nekopoi.care', '').trim();

            $('div.liner').each((i, e) => {
                $(e).find('div.listlink a').each((j, s) => {
                    links.push({
                        name: $(s).text().trim(),
                        link: $(s).attr('href')
                    });
                });
            });

            if (links.length === 0) throw new Error('Link download tidak ditemukan.');

            return { success: true, result: { title, links } };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }
};

// Main Export buat Web API Lu
module.exports = function(app) {
    app.get("/search/nekopoi", async (req, res) => {
        const { url } = req.query;

        try {
            let result;
            if (url) {
                // Jika ada parameter URL, jalankan get Video (Extract Download)
                result = await nekopoi.getVideo(url);
            } else {
                // Jika kosongan, jalankan get Latest (Random Update)
                result = await nekopoi.getLatest();
            }

            if (result.success) {
                return res.json({
                    status: true,
                    creator: "HamzBotzzzzz",
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxxx",
                    message: result.message
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
