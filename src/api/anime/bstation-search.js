const axios = require("axios");
const cheerio = require("cheerio");

async function BSearch(query) {
   try {
      let { data: m } = await axios.get(`https://www.bilibili.tv/id/search-result?q=${encodeURIComponent(query)}`);
      let $ = cheerio.load(m);

      const results = [];
      $('li.section__list__item').each((index, element) => {
         const title = $(element).find('.highlights__text--active').text().trim();
         const videoLink = $(element).find('.bstar-video-card__cover-link').attr('href');
         const thumbnail = $(element).find('.bstar-video-card__cover-img source').attr('srcset');
         const views = $(element).find('.bstar-video-card__desc--normal').text().trim();
         const creatorName = $(element).find('.bstar-video-card__nickname').text().trim();
         const creatorLink = $(element).find('.bstar-video-card__nickname').attr('href');
         const duration = $(element).find('.bstar-video-card__cover-mask-text').text().trim();

         results.push({
            title,
            videoLink: videoLink ? `https://www.bilibili.tv${videoLink}` : null,
            thumbnail,
            views,
            creatorName,
            creatorLink: creatorLink ? `https://www.bilibili.tv${creatorLink}` : null,
            duration
         });
      });

      return results;
   } catch (error) {
      console.error("Error while fetching search results:", error);
      throw error;
   }
}

module.exports = function(app) {
    app.get("/anime/bstation-search", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await BSearch(query);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan pencarian di Bilibili"
            });
        }
    });
};