const axios = require('axios')
const cheerio = require('cheerio')

async function tiktok(url) {
    try {
        let RegToktok = url.match(/(?:http(?:s|):\/\/|)(?:www\.|)tiktok.com\/@([-_0-9A-Za-z]{3,14})\/video\/([0-9]{8,50})(?:\?is_copy_url=0&is_from_webapp=v1&sender_device=pc&sender_web_id=(?:[0-9]{8,50}))|(?:http(?:s|):\/\/|)(?:vt\.tiktok\.com\/([-_0-9A-Za-z]{3,14}))/g)
        if (!RegToktok) throw new Error('URL Invalid')
        
        const data = await axios({
            url: "https://musicaldown.com/id",
            method: "GET",
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
            }
        })
        
        const $ = cheerio.load(data.data)
        let FORM = {
            [`${$("#link_url").attr("name")}`]: url,
            [`${$("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name")}`]: $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value"),
            verify: $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value")
        }
        
        const getPost = await axios({
            url: "https://musicaldown.com/id/download",
            method: "POST",
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
                "cookie": data.headers["set-cookie"].join("")
            },
            data: new URLSearchParams(Object.entries(FORM))
        })
        
        const c = cheerio.load(getPost.data)
        const Format = {
            nowm: c("body > div.welcome.section > div").find("div:nth-child(2) > div.col.s12.l8 > a:nth-child(4)").attr("href"),
            mp4: c("body > div.welcome.section").find("div > div:nth-child(2) > div.col.s12.l8 > a:nth-child(6)").attr("href"),
            original: c("body > div.welcome.section > div").find("div:nth-child(2) > div.col.s12.l8 > a:nth-child(8)").attr("href")
        }
        
        return {
            success: true,
            result: Format,
            timestamp: new Date().toISOString()
        }
        
    } catch(err) {
        return {
            success: false,
            message: err.message
        }
    }
}

module.exports = function(app) {
    app.get("/download/tiktok4", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await tiktok(url);
            
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
                    message: result.message || "Gagal mendownload video TikTok"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video TikTok"
            });
        }
    });
};