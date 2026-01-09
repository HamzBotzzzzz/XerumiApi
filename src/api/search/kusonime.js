const axios = require('axios');
const cheerio = require('cheerio');

async function kusoNime(query) {
    try {
        const optionsGet = {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 9; Redmi 7A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.99 Mobile Safari/537.36'
            }
        };
        
        const getHtml = await axios.get('https://kusonime.com/?s=' + query + '&post_type=anime', optionsGet);
        const $ = cheerio.load(getHtml.data);
        const url = [];
        
        $('div > div > ul > div > div > div').each(function() {
            url.push($(this).find('a').attr('href'));
        });
        
        if (url.length === 0) {
            throw new Error('Anime tidak ditemukan');
        }
        
        const randomUrl = url[Math.floor(Math.random() * url.length)];
        const getHtml2 = await axios.get(randomUrl, optionsGet);
        const $$ = cheerio.load(getHtml2.data);
        
        const result = {
            title: $$('.vezone > .venser').find('.jdlz').text(),
            thumb: $$('.vezone > .venser').find('div > img').attr('src'),
            views: $$('.vezone > .venser').find('div > div > span').text().trim().replace(' Views', ''),
            genre: $$('.vezone > .venser').find('.lexot > .info > p').eq(1).text().replace('Genre : ', ''),
            seasons: $$('.vezone > .venser').find('.lexot > .info > p').eq(2).text().replace('Seasons : ', ''),
            producers: $$('.vezone > .venser').find('.lexot > .info > p').eq(3).text().replace('Producers: ', ''),
            type: $$('.vezone > .venser').find('.lexot > .info > p').eq(4).text().replace('Type: ', ''),
            status: $$('.vezone > .venser').find('.lexot > .info > p').eq(5).text().replace('Status: ', ''),
            rating: $$('.vezone > .venser').find('.lexot > .info > p').eq(7).text().replace('Score: ', ''),
            duration: $$('.vezone > .venser').find('.lexot > .info > p').eq(8).text().replace('Duration: ', ''),
            release: $$('.vezone > .venser').find('.lexot > .info > p').eq(9).text().replace('Released on: ', ''),
            desc: $$('.vezone > .venser').find('p').eq(10).text(),
            url: randomUrl
        };
        
        return {
            success: true,
            result: result,
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
    app.get("/search/kusonime", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await kusoNime(query);
            
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
                    message: result.message || "Gagal mencari anime"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari anime"
            });
        }
    });
};