const axios = require('axios');

async function ssweb(url, device = 'desktop') {
    return new Promise((resolve, reject) => {
        const base = 'https://www.screenshotmachine.com'
        const param = {
            url: url,
            device: device,
            cacheLimit: 0
        }
        
        axios({
            url: base + '/capture.php',
            method: 'POST',
            data: new URLSearchParams(Object.entries(param)),
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then((data) => {
            const cookies = data.headers['set-cookie']
            
            if (data.data.status == 'success') {
                axios.get(base + '/' + data.data.link, {
                    headers: {
                        'cookie': cookies.join('')
                    },
                    responseType: 'arraybuffer'
                }).then(({ data }) => {
                    resolve({
                        success: true,
                        buffer: data,
                        timestamp: new Date().toISOString()
                    });
                }).catch(reject);
            } else {
                reject({ 
                    success: false,
                    message: 'Link Error',
                    data: data.data 
                });
            }
        }).catch(reject);
    });
}

module.exports = function(app) {
    app.get("/tools/ssweb2", async (req, res) => {
        const { url, device = 'desktop' } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await ssweb(url, device);
            
            if (result.success) {
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Length', result.buffer.length);
                return res.send(result.buffer);
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: error.message || "Gagal mengambil screenshot"
            });
        }
    });
};