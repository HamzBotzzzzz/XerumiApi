const axios = require('axios');

async function Quran(surah, ayat) {
    try {
        const response = await axios.get(encodeURI(`https://alquran-apiii.vercel.app/surah/${surah}/${ayat}`));
        
        return {
            success: true,
            result: response.data,
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
    app.get("/random/alquran", async (req, res) => {
        const { surah, ayat } = req.query;
        
        if (!surah) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'surah' wajib diisi."
            });
        }

        try {
            const result = await Quran(surah, ayat || '');
            
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
                    message: result.message || "Gagal mengambil data Al-Qur'an"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Al-Qur'an"
            });
        }
    });
};