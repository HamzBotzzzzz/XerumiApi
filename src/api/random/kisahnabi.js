const axios = require('axios');

async function Searchnabi(nabi = 'adam') {
    try {
        // Membuat URL berdasarkan input atau default 'adam'
        const url = `https://raw.githubusercontent.com/Aprilia3/RestApi/refs/heads/master/data/kisahNabi/${nabi.toLowerCase()}.json`;
        
        // Mengambil data dari URL
        const response = await axios.get(url);
        const scraper = response.data;

        // Format respons sesuai dengan struktur JSON yang diberikan
        const result = {
            status: true,
            creator: "aerixxx",
            name: scraper.name,
            kelahiran: scraper.thn_kelahiran + ' sebelum masehi',
            wafat_usia: scraper.usia + ' tahun',
            singgah: scraper.tmp,
            thumb: scraper.image_url, // Sesuaikan dengan key yang ada di JSON
            kisah: scraper.description
        };

        return result;
    } catch (error) {
        // Menangani error, termasuk jika file tidak ditemukan (404)
        console.error('Error fetching nabi data:', error.message);
        return {
            status: false,
            creator: "aerixxx",
            message: `Gagal mengambil data kisah nabi. Pastikan nama nabi benar. (Error: ${error.response?.status || 'Tidak dapat terhubung'})`
        };
    }
}

module.exports = function(app) {
    app.get("/random/kisahnabi", async (req, res) => {
        // Ambil parameter 'nabi' dari query, default 'adam'
        const { nabi = 'adam' } = req.query;

        try {
            const result = await Searchnabi(nabi);
            
            if (result.status) {
                return res.json(result);
            } else {
                // Jika status false, kirim pesan error
                return res.status(404).json(result);
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Terjadi kesalahan internal server."
            });
        }
    });
};