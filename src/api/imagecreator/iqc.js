const axios = require("axios");

async function iqc(prompt) {
    try {
        if (!prompt) throw new Error('Prompt diperlukan');
        
        const response = await axios.get("https://api-faa.my.id/faa/iqc", {
            params: { prompt: prompt },
            responseType: 'arraybuffer',
            timeout: 30000
        });
        
        return {
            success: true,
            buffer: response.data,
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
    app.get("/imagecreator/iqc", async (req, res) => {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        try {
            const result = await iqc(prompt);
            
            if (result.success) {
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Length', result.buffer.length);
                return res.send(result.buffer);
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal membuat gambar"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal membuat gambar"
            });
        }
    });
};