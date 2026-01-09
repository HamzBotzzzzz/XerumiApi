const axios = require("axios");
const qs = require("qs");

async function scrape(query) {
    try {
        const data = qs.stringify({
            message: query,
            messageCount: "1",
        });

        const config = {
            method: "POST",
            url: "https://powerbrainai.com/chat.php",
            headers: {
                "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
                "Content-Type": "application/x-www-form-urlencoded",
                "accept-language": "id-ID",
                "referer": "https://powerbrainai.com/chat.html",
                "origin": "https://powerbrainai.com",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "priority": "u=0",
                "te": "trailers",
            },
            data: data,
            timeout: 30000,
        };

        const response = await axios.request(config);
        
        return {
            success: true,
            result: response.data.response,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return {
            success: false,
            message: "Failed to get response from PowerBrain AI."
        };
    }
}

module.exports = function(app) {
    app.get("/ai/powerbrainai", async (req, res) => {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        if (typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Query harus berupa string yang tidak kosong."
            });
        }

        try {
            const result = await scrape(query.trim());
            
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
                    message: result.message || "Gagal mendapatkan respons dari PowerBrain AI"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan respons dari PowerBrain AI"
            });
        }
    });
};