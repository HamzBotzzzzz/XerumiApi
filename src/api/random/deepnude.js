const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const CONFIG = {
    BASE_URL: 'https://app.live3d.io',
    CDN_URL: 'https://temp.live3d.io/',
    ENDPOINTS: {
        UPLOAD: '/aitools/upload-img',
        CREATE: '/aitools/of/create',
        STATUS: '/aitools/of/check-status'
    },
    SECRETS: {
        FP: '78dc286eaeb7fb88586e07f0d18bf61b',
        APP_ID: 'aifaceswap',
        PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`
    },
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua-platform': '"Android"',
        'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
        'origin': 'https://live3d.io',
        'referer': 'https://live3d.io/',
        'priority': 'u=1, i'
    }
};

const utils = {
    genHex: (bytes) => crypto.randomBytes(bytes).toString('hex'),
    
    genRandomString: (length) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return result;
    },

    aesEncrypt: (plaintext, keyStr, ivStr) => {
        const key = Buffer.from(keyStr, 'utf8');
        const iv = Buffer.from(ivStr, 'utf8');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    },

    rsaEncrypt: (data) => {
        const buffer = Buffer.from(data, 'utf8');
        const encrypted = crypto.publicEncrypt({
            key: CONFIG.SECRETS.PUBLIC_KEY,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, buffer);
        return encrypted.toString('base64');
    },

    generateHeaders: () => {
        const aesKey = utils.genRandomString(16);
        const xCode = Date.now().toString();
        const xGuide = utils.rsaEncrypt(aesKey);
        const plaintextFp = `${CONFIG.SECRETS.APP_ID}:${CONFIG.SECRETS.FP}`;
        const fp1 = utils.aesEncrypt(plaintextFp, aesKey, aesKey);

        return {
            ...CONFIG.HEADERS,
            'x-code': xCode,
            'x-guide': xGuide,
            'fp': CONFIG.SECRETS.FP,
            'fp1': fp1
        };
    }
};

async function deepnude(imagePath) {
    try {
        if (!fs.existsSync(imagePath)) throw new Error('File tidak ditemukan.');
        
        const originFrom = utils.genHex(8);
        const requestFrom = 9;

        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));
        form.append('fn_name', 'cloth-change');
        form.append('request_from', requestFrom.toString());
        form.append('origin_from', originFrom);

        const uploadHeaders = { ...utils.generateHeaders(), ...form.getHeaders() };
        
        const uploadRes = await axios.post(CONFIG.BASE_URL + CONFIG.ENDPOINTS.UPLOAD, form, { headers: uploadHeaders });
        let serverPath = uploadRes.data?.data;
        if (typeof serverPath === 'object' && serverPath.path) serverPath = serverPath.path;

        if (!serverPath) throw new Error("Gagal mendapatkan path server.");

        const submitPayload = {
            "fn_name": "cloth-change",
            "call_type": 3,
            "input": {
                "source_image": serverPath,
                "prompt": "best quality, naked, nude",
                "cloth_type": "full_outfits",
                "request_from": requestFrom,
                "type": 1
            },
            "request_from": requestFrom,
            "origin_from": originFrom
        };

        const submitRes = await axios.post(CONFIG.BASE_URL + CONFIG.ENDPOINTS.CREATE, submitPayload, {
            headers: { ...utils.generateHeaders(), 'Content-Type': 'application/json' }
        });

        const taskId = submitRes.data?.data?.task_id;
        if (!taskId) throw new Error("Gagal mendapatkan Task ID.");

        let resultUrl = null;
        let attempts = 0;
        const maxAttempts = 40;

        while (!resultUrl && attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 3000));

            const statusPayload = {
                "task_id": taskId,
                "fn_name": "cloth-change",
                "call_type": 3,
                "consume_type": 0,
                "request_from": requestFrom,
                "origin_from": originFrom
            };

            const statusRes = await axios.post(CONFIG.BASE_URL + CONFIG.ENDPOINTS.STATUS, statusPayload, {
                headers: { ...utils.generateHeaders(), 'Content-Type': 'application/json' }
            });

            const data = statusRes.data?.data;
            if (data && data.status === 2) {
                resultUrl = data.result_image;
                if (resultUrl && !resultUrl.startsWith('http')) {
                    resultUrl = CONFIG.CDN_URL + resultUrl;
                }
                break;
            }
        }

        if (!resultUrl) throw new Error("Timeout generating image.");

        return {
            success: true,
            result: resultUrl,
            taskId: taskId,
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
    app.get("/random/deepnude", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi. (URL gambar)"
            });
        }

        try {
            const tempPath = path.join(__dirname, '../temp_image.jpg');
            const imageRes = await axios.get(url, { responseType: 'stream' });
            const writer = fs.createWriteStream(tempPath);
            imageRes.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const result = await deepnude(tempPath);
            
            fs.unlinkSync(tempPath);
            
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
                    message: result.message || "Gagal memproses gambar"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal memproses deepnude"
            });
        }
    });
};