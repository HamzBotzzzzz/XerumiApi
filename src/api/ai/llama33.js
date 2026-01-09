const axios = require("axios");

async function scrapeLlama33(prompt, text) {
    try {
        const payload = {
            model: "meta-llama/Llama-3.3-70B-Instruct",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text },
            ],
            stream: false,
        };

        const headers = {
            "Content-Type": "application/json",
            "X-Deepinfra-Source": "web-page",
            accept: "text/event-stream",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
            Referer: "https://deepinfra.com/chat",
        };

        const response = await axios.post(
            "https://api.deepinfra.com/v1/openai/chat/completions",
            payload,
            { headers }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        throw new Error(error.response ? error.response.data.error : "Failed to get response from Llama 3.3 API");
    }
}

module.exports = function(app) {
    app.get("/ai/llama33", async (req, res) => {
        const { prompt, text } = req.query;

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        if (typeof prompt !== "string" || prompt.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Prompt harus berupa string yang tidak kosong."
            });
        }

        if (prompt.length > 1000) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Prompt maksimal 1000 karakter."
            });
        }

        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'text' wajib diisi."
            });
        }

        if (typeof text !== "string" || text.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Text harus berupa string yang tidak kosong."
            });
        }

        if (text.length > 2000) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Text maksimal 2000 karakter."
            });
        }

        try {
            const result = await scrapeLlama33(prompt.trim(), text.trim());

            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan respons dari Llama 3.3"
            });
        }
    });
};