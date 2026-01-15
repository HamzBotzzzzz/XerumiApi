const axios = require('axios');
const cheerio = require('cheerio');

async function merdekanews() {
    return new Promise((resolve, reject) => {
        axios.get('https://www.merdeka.com/peristiwa/')
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const judul = [];
                const upload = [];
                const link = [];
                const thumb = [];
                const result = [];
                
                $('#mdk-content-center > div.inner-content > ul > li > div').each(function(a, b) {
                    const deta = $(b).find('h3 > a').text();
                    judul.push(deta);
                    link.push('https://www.merdeka.com' + $(b).find('h3 > a').attr('href'));
                    upload.push($(b).find('div > span').text());
                    thumb.push($(b).find('div > a > img').attr('src'));
                });
                
                for (let i = 0; i < judul.length; i++) {
                    result.push({
                        judul: judul[i],
                        upload_date: upload[i],
                        link: link[i],
                        thumb: thumb[i]
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
    app.get("/berita/merdeka", async (req, res) => {
        try {
            const result = await merdekanews();
            
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
                message: "Gagal mengambil berita dari Merdeka.com"
            });
        }
    });
};