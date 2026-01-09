const axios = require('axios');

async function scrapeGita(q) {
    try {
        const response = await axios.get(
            `https://gitagpt.org/api/ask/gita?q=${encodeURIComponent(q)}&email=null&locale=id`,
            {
                timeout: 30000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
                    "Referer": "https://gitagpt.org/#",
                },
            }
        );
        return response.data.response;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get response from Gita AI");
    }
}

module.exports = function (app) {
    // GET Method
    app.get("/ai/gita", async (req, res) => {
        const { q } = req.query;

        if (!q || typeof q !== "string" || q.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Parameter 'q' (query) is required"
            });
        }

        try {
            const data = await scrapeGita(q.trim());
            return res.json({
                status: true,
                creator: "aerixxx",
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                error: error.message
            });
        }
    });

    // POST Method
    app.post("/ai/gita", async (req, res) => {
        const { q } = req.body;

        if (!q) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Body parameter 'q' is required"
            });
        }

        try {
            const data = await scrapeGita(q.trim());
            return res.json({
                status: true,
                creator: "aerixxx",
                data: data
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                error: error.message
            });
        }
    });
};
