const axios = require('axios');
const cheerio = require('cheerio');

async function stickersearch(query) {
    return new Promise((resolve, reject) => {
        axios.get(`https://getstickerpack.com/stickers?query=${query}`).then(({ data }) => {
            const $ = cheerio.load(data);
            const link = [];
            
            $('#stickerPacks > div > div:nth-child(3) > div > a').each(function(a, b) {
                link.push($(b).attr('href'));
            });
            
            if (link.length === 0) {
                reject(new Error('Tidak ada stiker ditemukan'));
                return;
            }
            
            const rand = link[Math.floor(Math.random() * link.length)];
            
            axios.get(rand).then(({ data }) => {
                const $$ = cheerio.load(data);
                const url = [];
                
                $$('#stickerPack > div > div.row > div > img').each(function(a, b) {
                    const src = $$(b).attr('src');
                    if (src) {
                        url.push(src.split('&d=')[0]);
                    }
                });
                
                resolve({
                    success: true,
                    result: {
                        title: $$('#intro > div > div > h1').text(),
                        author: $$('#intro > div > div > h5 > a').text(),
                        author_link: $$('#intro > div > div > h5 > a').attr('href'),
                        sticker: url,
                    },
                    timestamp: new Date().toISOString()
                });
            }).catch(reject);
        }).catch(reject);
    });
}

module.exports = function(app) {
    app.get("/search/sticker", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await stickersearch(query);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari stiker"
            });
        }
    });
};