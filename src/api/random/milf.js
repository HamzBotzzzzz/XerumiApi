const https = require('https');

let cachedUrls = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP error! status: ${response.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

function httpsGetBuffer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
            } else {
                reject(new Error(`HTTP error! status: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function fetchAndCacheImages() {
    try {
        const data = await httpsGet('https://raw.githubusercontent.com/HamzBotzzzzz/zxynnBotz/refs/heads/master/scraper/sfw/milf.json');
        const parsedData = JSON.parse(data);
        
        if (!Array.isArray(parsedData)) {
            throw new Error('Data from GitHub is not an array');
        }
        
        cachedUrls = parsedData;
        lastFetchTime = Date.now();
        return parsedData;
    } catch (error) {
        throw error;
    }
}

async function getRandomMilf() {
    try {
        const isCacheExpired = Date.now() - lastFetchTime > CACHE_DURATION;
        const hasCachedUrls = cachedUrls.length > 0;
        
        if (!hasCachedUrls || isCacheExpired) {
            await fetchAndCacheImages();
        }
        
        if (cachedUrls.length === 0) {
            throw new Error('No image URLs available');
        }
        
        const randomIndex = Math.floor(Math.random() * cachedUrls.length);
        const selectedUrl = cachedUrls[randomIndex];
        
        if (!selectedUrl || typeof selectedUrl !== 'string') {
            throw new Error('Invalid image URL');
        }
        
        const imageBuffer = await httpsGetBuffer(selectedUrl);
        return {
            success: true,
            buffer: imageBuffer,
            url: selectedUrl,
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
    app.get("/random/milf", async (req, res) => {
        try {
            const result = await getRandomMilf();
            
            if (result.success) {
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Length', result.buffer.length);
                return res.send(result.buffer);
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mengambil gambar"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Terjadi kesalahan internal"
            });
        }
    });
};