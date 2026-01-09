const axios = require("axios");

async function cekkoutaaxisxl(nomorhp) {
    try {
        const { data } = await axios.get(`https://bendith.my.id/end.php`, {
            params: {
                check: "package",
                number: nomorhp,
                version: "2 201"
            }
        });
        return data;
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = function(app) {
    app.get("/random/cekkuota", async (req, res) => {
        const { nomor } = req.query;
        
        if (!nomor) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'nomor' wajib diisi."
            });
        }

        try {
            const result = await cekkoutaaxisxl(nomor);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengecek kuota"
            });
        }
    });
};