const axios = require("axios");

async function scrape(query) {
    try {
        const responseSearch = await axios.post(
            "https://www.muslimai.io/api/search",
            { query: query },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
                    "Referer": "https://www.muslimai.io/",
                },
                timeout: 30000,
            }
        );

        const ayatData = responseSearch.data;
        const content = ayatData?.[0]?.content;

        if (!content) {
            throw new Error("No data found for the query");
        }

        const prompt = `Use the following passages to answer the query in Indonesian, ensuring clarity and understanding, as a world-class expert in the Quran. Do not mention that you were provided any passages in your answer: ${query}\n\n${content}`;

        const responseAnswer = await axios.post(
            "https://www.muslimai.io/api/answer",
            { prompt: prompt },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
                    "Referer": "https://www.muslimai.io/",
                },
                timeout: 30000,
            }
        );

        const jawaban = responseAnswer.data;

        if (!jawaban) {
            throw new Error("Error retrieving the answer");
        }

        return {
            success: true,
            result: jawaban,
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
    app.get("/ai/muslimai", async (req, res) => {
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
                const statusCode = result.message === "No data found for the query" ? 404 : 500;
                return res.status(statusCode).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mendapatkan jawaban dari Muslim AI"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan jawaban dari Muslim AI"
            });
        }
    });
};