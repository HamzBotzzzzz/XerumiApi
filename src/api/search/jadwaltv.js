const axios = require('axios');
const cheerio = require('cheerio');

async function jadwaltv(channel) {
    return new Promise((resolve, reject) => {
        axios.get('https://www.jadwaltv.net/channel/' + channel).then(({ data }) => {
            const $ = cheerio.load(data);
            const acara = [];
            const jam = [];
            const result = [];
            
            $('div > div > table > tbody > tr').each(function(a, b) {
                if ($(b).find('td:nth-child(1)').text() != 'Jam') {
                    jam.push($(b).find('td:nth-child(1)').text());
                }
                if ($(b).find('td:nth-child(2)').text() != 'Acara') {
                    acara.push($(b).find('td:nth-child(2)').text());
                }
            });
            
            for (let i = 0; i < acara.length; i++) {
                result.push({
                    acara: acara[i],
                    jam: jam[i],
                });
            }
            
            const format = result.filter((mek) => mek.acara != 'Jadwal TV selengkapnya di JadwalTV.Net');
            
            resolve({
                success: true,
                result: {
                    channel: channel,
                    schedule: format
                },
                timestamp: new Date().toISOString()
            });
        }).catch(reject);
    });
}

module.exports = function(app) {
    app.get("/search/jadwaltv", async (req, res) => {
        const { channel } = req.query;
        
        if (!channel) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'channel' wajib diisi."
            });
        }

        try {
            const result = await jadwaltv(channel);
            
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
                message: "Gagal mengambil jadwal TV"
            });
        }
    });
};