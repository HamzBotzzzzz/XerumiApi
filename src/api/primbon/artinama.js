const axios = require('axios');
const cheerio = require('cheerio');

async function artinama(query) {
    return new Promise((resolve, reject) => {
        const queryy = query.replace(/ /g, '+');
        
        axios.get('https://www.primbon.com/arti_nama.php?nama1=' + queryy + '&proses=+Submit%21+')
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const result = $('#body').text();
                const result2 = result.split('\n      \n        \n        \n')[0];
                const result4 = result2.split('ARTI NAMA')[1];
                const result5 = result4.split('.\n\n');
                const result6 = result5[0] + '\n\n' + result5[1];
                
                resolve({
                    success: true,
                    result: result6.trim(),
                    query: query,
                    timestamp: new Date().toISOString()
                });
            })
            .catch(reject);
    });
}

module.exports = function(app) {
    app.get("/primbon/artinama", async (req, res) => {
        const { nama } = req.query;
        
        if (!nama) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'nama' wajib diisi."
            });
        }

        try {
            const result = await artinama(nama);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari arti nama"
            });
        }
    });
};