const request = require('request');
const cheerio = require('cheerio');

async function igdl(link) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://downloadgram.org/#downloadhere',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            formData: {
                url: link,
                submit: '',
            },
        }
        request(options, async function(error, response, body) {
            if (error) reject(new Error(error));
            
            const $ = cheerio.load(body);
            const result = [];
            
            $('#downloadBox > a').each(function(a, b) {
                result.push($(b).attr('href'));
            });
            
            resolve(result);
        });
    });
}

module.exports = function(app) {
    app.get("/download/instagram2", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await igdl(url);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload dari Instagram"
            });
        }
    });
};