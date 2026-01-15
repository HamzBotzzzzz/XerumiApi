const axios = require('axios');

async function SimSimi(teks) {
    return new Promise(async (resolve, reject) => {
        try {
            const params = new URLSearchParams();
            params.append('text', teks);
            params.append('lc', 'id');

            const response = await axios.post(
                'https://api.simsimi.vn/v2/simtalk',
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            resolve(response.data.message);
        } catch (e) {
            resolve("Aku tidak mengerti apa yang kamu katakan. Tolong ajari aku.");
        }
    });
}

module.exports = function(app) {
    app.get("/ai/simsimi", async (req, res) => {
        const { teks } = req.query;
        
        if (!teks) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'teks' wajib diisi."
            });
        }

        try {
            const result = await SimSimi(teks);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal berkomunikasi dengan SimSimi"
            });
        }
    });
};