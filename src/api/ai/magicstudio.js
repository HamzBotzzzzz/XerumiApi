const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

const createImageResponse = (buffer, res) => {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(buffer);
};

async function scrapeMagicStudio(prompt) {
    const generateClientId = () => {
        return crypto.randomBytes(32).toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    };

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("output_format", "bytes");
    form.append("user_profile_id", "null");
    form.append("anonymous_user_id", crypto.randomUUID());
    form.append("request_timestamp", (Date.now() / 1000).toFixed(3));
    form.append("user_is_subscribed", "false");
    form.append("client_id", generateClientId());

    try {
        const response = await axios.post(
            "https://ai-api.magicstudio.com/api/ai-art-generator",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "accept": "application/json, text/plain, */*",
                    "origin": "https://magicstudio.com",
                    "referer": "https://magicstudio.com/ai-art-generator/",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
                },
                responseType: "arraybuffer",
                timeout: 30000,
            }
        );
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(error.message || "Failed to generate image");
    }
}

module.exports = function (app) {
    app.get("/ai/magicstudio", async (req, res) => {
        const { prompt } = req.query;

        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Parameter 'prompt' is required"
            });
        }

        try {
            const imageBuffer = await scrapeMagicStudio(prompt.trim());
            return createImageResponse(imageBuffer, res);
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                error: error.message
            });
        }
    });

    app.post("/ai/magicstudio", async (req, res) => {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Parameter 'prompt' is required"
            });
        }

        try {
            const imageBuffer = await scrapeMagicStudio(prompt.trim());
            return createImageResponse(imageBuffer, res);
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                error: error.message
            });
        }
    });
};
