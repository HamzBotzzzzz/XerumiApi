const axios = require('axios');
const cheerio = require('cheerio');

async function hariBaik(tanggal, bulan, tahun) {
    return new Promise((resolve, reject) => {
        const tgl = tanggal || new Date().getDate();
        const bln = bulan || new Date().getMonth() + 1;
        const thn = tahun || new Date().getFullYear();

        axios.get('https://www.primbon.com/petung_hari_baik.htm')
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const form = $('form');
                
                if (!form.length) {
                    return reject(new Error('Form tidak ditemukan'));
                }

                const formData = new URLSearchParams();
                formData.append('tgl', tgl);
                formData.append('bln', bln);
                formData.append('thn', thn);
                formData.append('kirim', ' TAMPILKAN ');

                const actionUrl = form.attr('action');
                const targetUrl = actionUrl 
                    ? `https://www.primbon.com/${actionUrl}`
                    : 'https://www.primbon.com/php/petung_hari_baik_hasil.php';

                return axios.post(targetUrl, formData.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.primbon.com',
                        'Referer': 'https://www.primbon.com/petung_hari_baik.htm'
                    }
                });
            })
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const bodyContent = $('#body').html();

                if (!bodyContent || bodyContent.includes('tidak ditemukan')) {
                    return resolve({
                        success: false,
                        message: "Hasil perhitungan tidak ditemukan"
                    });
                }

                let hasilText = '';
                const paragraphs = $('#body').find('p, font');

                paragraphs.each((i, elem) => {
                    const text = $(elem).text().trim();
                    const html = $(elem).html();
                    
                    if (text && text.length > 5 && 
                        !text.includes('ADVERTISEMENT') && 
                        !text.includes('Kembali ke') &&
                        !text.includes('-->') &&
                        !html.includes('ADVERTISEMENT')) {
                        
                        const cleanText = text
                            .replace(/\s+/g, ' ')
                            .replace(/ADVERTISEMENT/g, '')
                            .trim();
                        
                        if (cleanText.length > 3) {
                            hasilText += cleanText + '\n\n';
                        }
                    }
                });

                if (!hasilText.trim()) {
                    const allText = $('#body').text();
                    const lines = allText.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 10 && 
                                !line.includes('ADVERTISEMENT') &&
                                !line.includes('Kembali ke'));
                    hasilText = lines.join('\n\n');
                }

                const finalResult = hasilText.trim();
                
                resolve({
                    success: true,
                    result: finalResult,
                    tanggal_input: `${tgl}/${bln}/${thn}`,
                    timestamp: new Date().toISOString()
                });
            })
            .catch(reject);
    });
}

module.exports = function(app) {
    app.get("/primbon/haribaik", async (req, res) => {
        const { tanggal, bulan, tahun } = req.query;
        
        const tgl = tanggal ? parseInt(tanggal) : undefined;
        const bln = bulan ? parseInt(bulan) : undefined;
        const thn = tahun ? parseInt(tahun) : undefined;

        try {
            const result = await hariBaik(tgl, bln, thn);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result,
                    info: {
                        tanggal: result.tanggal_input
                    }
                });
            } else {
                return res.json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message
                });
            }
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan perhitungan hari baik"
            });
        }
    });
};