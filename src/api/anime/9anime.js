const axios = require('axios');
const cheerio = require('cheerio');

async function anime9(anime) {
    const { data: dataa } = await axios.get(`https://9animetv.to/search?keyword=${anime}`);

    const $ = cheerio.load(dataa);

    const result = [];

    $('.flw-item')
        .each((i, element) => {
            const title = $(element)
                .find('.film-name a')
                .attr('title');
            const url = 'https://9animetv.to' + $(element)
                .find('.film-name a')
                .attr('href');
            const imgSrc = $(element)
                .find('.film-poster-img')
                .attr('data-src');
            const quality = $(element)
                .find('.tick-quality')
                .text();
            const subOrDub = $(element)
                .find('.tick-sub')
                .text() || $(element)
                .find('.tick-dub')
                .text();
            const episode = $(element)
                .find('.tick-eps')
                .text()
                .replace(/\s+/g, ' ')
                .trim();

            result.push({
                title,
                url,
                imgSrc,
                quality,
                subOrDub,
                episode
            });
        });

    return result;
}

module.exports = function(app) {
    app.get("/anime/9anime", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await anime9(query);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari anime di 9anime"
            });
        }
    });
};