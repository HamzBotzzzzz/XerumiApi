const axios = require('axios');

async function scrapeFelo(query) {
    const headers = {
        "Accept": "*/*",
        "User-Agent": "Postify/1.0.0",
        "Content-Type": "application/json",
    };

    const payload = {
        query,
        search_uuid: Date.now().toString(),
        search_options: { langcode: "id-MM" },
        search_video: true,
    };

    try {
        const response = await axios.post(
            "https://api.felo.ai/search/threads",
            payload,
            {
                headers,
                timeout: 30000,
                responseType: "text",
            }
        );

        const result = { answer: "", source: [] };
        const lines = response.data.split("\n");

        lines.forEach((line) => {
            if (line.startsWith("data:")) {
                try {
                    const parsed = JSON.parse(line.slice(5).trim());
                    if (parsed.data) {
                        if (parsed.data.text) {
                            result.answer = parsed.data.text.replace(/\[\d+\]/g, "");
                        }
                        if (parsed.data.sources) {
                            result.source = parsed.data.sources;
                        }
                    }
                } catch (e) {
                    // silent fail
                }
            }
        });

        return result;
    } catch (error) {
        throw new Error(error.message || "Failed to get response from Felo");
    }
}

module.exports = function (app) {
    app.get("/ai/felo", async (req, res) => {
        const { query } = req.query;

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Parameter 'query' is required"
            });
        }

        try {
            const result = await scrapeFelo(query.trim());
            return res.json({
                status: true,
                creator: "aerixxx",
                data: result,
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

    app.post("/ai/felo", async (req, res) => {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Parameter 'query' is required"
            });
        }

        try {
            const result = await scrapeFelo(query.trim());
            return res.json({
                status: true,
                creator: "aerixxx",
                data: result
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
