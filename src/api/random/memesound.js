const axios = require("axios");
const cheerio = require('cheerio');

const memeSound = async (nameSound) => {
   let URI = `https://www.myinstants.com/en/search/?name=${nameSound}`;
   let { data } = await axios.get(URI);
   let $ = cheerio.load(data);

   let results = [];

   $('.instant').each((index, element) => {
       let instant = {};

       instant.backgroundColor = $(element).find('.circle').attr('style');

       const onclickAttr = $(element).find('button.small-button').attr('onclick');
       const audioMatch = onclickAttr ? onclickAttr.match(/play\('(\/media\/sounds\/.*?\.mp3)'/) : null;
       instant.audioUrl = audioMatch ? `https://www.myinstants.com${audioMatch[1]}` : null;

       instant.title = $(element).find('button.small-button').attr('title');
       instant.text = $(element).find('.instant-link').text();
       instant.url = $(element).find('.instant-link').attr('href');

       results.push(instant);
   });

   return results;
};

module.exports = function(app) {
    app.get("/random/memesound", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await memeSound(query);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari meme sound"
            });
        }
    });
};