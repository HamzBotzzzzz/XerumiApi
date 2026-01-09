const axios = require('axios');

class GeminiLite {
    constructor() {
        this.baseUrl = "https://us-central1-infinite-chain-295909.cloudfunctions.net/gemini-proxy-staging-v1";
        this.headers = {
            "accept": "*/*",
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        };
    }

    async getImage(imgUrl) {
        try {
            const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
            return {
                mime_type: response.headers["content-type"],
                data: Buffer.from(response.data).toString("base64"),
            };
        } catch (error) {
            throw new Error("Gagal mengambil gambar dari URL");
        }
    }

    async chat({ prompt, model = "gemini-2.0-flash-lite", imgUrl }) {
        try {
            let parts = [];
            if (imgUrl) {
                const imageData = await this.getImage(imgUrl);
                parts.push({ inline_data: imageData });
            }
            parts.push({ text: prompt });

            const requestData = {
                model,
                contents: [{ parts }],
            };

            const response = await axios.post(this.baseUrl, requestData, { headers: this.headers });
            return response.data.candidates[0].content;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || "Gemini Proxy Error");
        }
    }
}

const geminiLite = new GeminiLite();

module.exports = function (app) {
    // GET Method
    app.get("ai/gemini-lite", async (req, res) => {
        const { prompt, model, imgUrl } = req.query;

        if (!prompt) {
            return res.status(400).json({ status: false, error: "Prompt is required" });
        }

        try {
            const result = await geminiLite.chat({
                prompt: prompt.trim(),
                model: model?.trim(),
                imgUrl: imgUrl?.trim()
            });

            return res.json({
                status: true,
                creator: "aerixxx",
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({ status: false, error: error.message });
        }
    });

    // POST Method
    app.post("/api/ai/gemini-lite", async (req, res) => {
        const { prompt, model, imgUrl } = req.body;

        if (!prompt) {
            return res.status(400).json({ status: false, error: "Prompt is required" });
        }

        try {
            const result = await geminiLite.chat({
                prompt: prompt.trim(),
                model: model?.trim(),
                imgUrl: imgUrl?.trim()
            });

            return res.json({
                status: true,
                creator: "aerixxx",
                data: result
            });
        } catch (error) {
            return res.status(500).json({ status: false, error: error.message });
        }
    });
};
