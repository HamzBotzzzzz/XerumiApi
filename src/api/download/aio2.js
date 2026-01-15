const axios = require('axios');
const crypto = require('crypto');

const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.amoyshare.com/',
        'Origin': 'https://www.amoyshare.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Priority': 'u=1, i'
    }
};

const generateHeader = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    mm = mm > 9 ? mm : "0" + mm;
    dd = dd > 9 ? dd : "0" + dd;

    const dateStr = `${yyyy}${mm}${dd}`;
    const constant = "786638952";

    const randomVal = 1000 + Math.round(8999 * Math.random());
    const key = `${dateStr}${constant}${randomVal}`;
    const hashInput = `${dateStr}${randomVal}${constant}`;
    
    const signature = crypto.createHash('md5')
        .update(hashInput)
        .digest('hex');

    return `${key}-${signature}`;
};

const download = async (videoUrl) => {
    const url = 'https://line.1010diy.com/web/free-mp3-finder/urlParse';
    const params = {
        url: videoUrl,
        phonydata: 'false'
    };
    
    const dynamicHeaders = {
        ...config.headers,
        'amoyshare': generateHeader()
    };

    const response = await axios.get(url, {
        params: params,
        headers: dynamicHeaders
    });

    return response.data;
};

module.exports = function(app) {
    app.get("/download/aio2", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await download(url);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload video"
            });
        }
    });
};