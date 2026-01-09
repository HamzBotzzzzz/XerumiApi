const axios = require('axios');
const cheerio = require('cheerio');

async function metronews() {
    return new Promise((resolve, reject) => {
        axios.get('https://www.metrotvnews.com/news')
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const judul = [];
                const desc = [];
                const link = [];
                const thumb = [];
                const result = [];
                
                $('body > div.container.layout > section.content > div > div.item-list.pt-20 > div > div > h3 > a').each(function(a, b) {
                    judul.push($(b).attr('title'));
                });
                
                $('body > div.container.layout > section.content > div > div.item-list.pt-20 > div > div > p').each(function(a, b) {
                    const deta = $(b).text();
                    desc.push(deta);
                });
                
                $('body > div.container.layout > section.content > div > div.item-list.pt-20 > div > div > h3 > a').each(function(a, b) {
                    link.push('https://www.metrotvnews.com' + $(b).attr('href'));
                });
                
                $('body > div.container.layout > section.content > div > div.item-list.pt-20 > div > img').each(function(a, b) {
                    thumb.push($(b).attr('src').replace('w=300', 'w=720'));
                });
                
                for (let i = 0; i < judul.length; i++) {
                    result.push({
                        judul: judul[i],
                        link: link[i],
                        thumb: thumb[i],
                        deskripsi: desc[i]
                    });
                }
                
                resolve({
                    success: true,
                    result: result,
                    count: result.length,
                    timestamp: new Date().toISOString()
                });
            })
            .catch(reject);
    });
}

module.exports = function(app) {
    app.get("/berita/metrotv", async (req, res) => {
        try {
            const result = await metronews();
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    count: result.count,
                    result: result.result
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil berita dari Metro TV News"
            });
        }
    });
};