const axios = require("axios");
const path = require("path");

// Import helper jika ada (opsional)
let PreviewHandler;
try {
    PreviewHandler = require(path.join(__dirname, '/fitur/preview-handler'));
    console.log('[IQC] PreviewHandler loaded');
} catch (error) {
    console.log('[IQC] Using internal preview handler');
}

async function iqc(prompt) {
    try {
        if (!prompt) throw new Error('Prompt diperlukan');
        
        console.log(`[IQC] Requesting image for prompt: "${prompt}"`);
        
        // Panggil API eksternal
        const response = await axios.get("https://api-faa.my.id/faa/iqc", {
            params: { 
                prompt: prompt.trim(),
                _: Date.now()
            },
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        });
        
        console.log(`[IQC] Response Status: ${response.status}`);
        console.log(`[IQC] Content-Type: ${response.headers['content-type']}`);
        console.log(`[IQC] Data Size: ${response.data?.length || 0} bytes`);
        
        // Validasi response
        if (!response.data || response.data.length === 0) {
            throw new Error('Response data kosong dari server eksternal');
        }
        
        // Konversi ke base64
        const base64Image = Buffer.from(response.data).toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;
        
        return {
            success: true,
            image: dataUrl, // Format base64 untuk preview handler
            buffer: response.data, // Original buffer jika perlu
            contentType: mimeType,
            size: response.data.length,
            message: `Gambar berhasil dibuat untuk prompt: "${prompt}"`,
            timestamp: new Date().toISOString(),
            metadata: {
                prompt: prompt,
                creator: "aerixxx",
                source: "api-faa.my.id"
            }
        };
        
    } catch (error) {
        console.error('[IQC Error]', error.message);
        
        let errorMessage = 'Gagal membuat gambar';
        let errorCode = 'UNKNOWN_ERROR';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Timeout: Server tidak merespon';
            errorCode = 'TIMEOUT';
        } else if (error.response) {
            errorMessage = `API Error: ${error.response.status}`;
            errorCode = `HTTP_${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Tidak ada response dari server eksternal';
            errorCode = 'NO_RESPONSE';
        }
        
        return {
            success: false,
            message: errorMessage,
            code: errorCode,
            originalError: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = function(app) {
    // Endpoint utama - mengembalikan JSON dengan base64 image
    app.get("/imagecreator/iqc", async (req, res) => {
        console.log('\n=== IQC IMAGE REQUEST ===');
        console.log('Time:', new Date().toISOString());
        console.log('IP:', req.ip);
        console.log('User-Agent:', req.headers['user-agent']);
        console.log('Prompt:', req.query.prompt);
        
        const { prompt } = req.query;
        
        // Validasi prompt
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi.",
                example: "gelooooo aerixxx",
                timestamp: new Date().toISOString()
            });
        }
        
        if (prompt.length > 500) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Prompt terlalu panjang (maks 500 karakter)",
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const result = await iqc(prompt);
            
            console.log('[IQC] Result:', {
                success: result.success,
                size: result.size,
                contentType: result.contentType
            });
            
            if (result.success) {
                // Format response untuk kompatibel dengan preview handler
                const responseData = {
                    status: true,
                    creator: "aerixxx",
                    message: result.message,
                    image: result.image, // Base64 image - akan di-handle oleh PreviewHandler.handleBase64Image()
                    metadata: {
                        prompt: prompt,
                        size: result.size,
                        contentType: result.contentType,
                        timestamp: result.timestamp
                    },
                    debug: process.env.NODE_ENV === 'development' ? {
                        size: result.size,
                        contentType: result.contentType,
                        prompt: prompt
                    } : undefined
                };
                
                return res.json(responseData);
            } else {
                console.error('[IQC] Failed:', result.message);
                
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal membuat gambar",
                    code: result.code,
                    timestamp: result.timestamp
                });
            }
            
        } catch (error) {
            console.error('[IQC] Server Error:', error);
            
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Terjadi kesalahan internal server",
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Alternate endpoint untuk binary langsung (jika masih perlu)
    app.get("/imagecreator/iqc/binary", async (req, res) => {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'prompt' diperlukan"
            });
        }
        
        try {
            const result = await iqc(prompt);
            
            if (result.success) {
                // Kirim binary langsung
                res.setHeader('Content-Type', result.contentType);
                res.setHeader('Content-Length', result.size);
                res.setHeader('X-Creator', 'aerixxx');
                return res.send(result.buffer);
            } else {
                return res.status(500).json({
                    status: false,
                    message: result.message
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
    
    // Debug endpoint
    app.get("/imagecreator/iqc/debug", async (req, res) => {
        const { prompt = "test" } = req.query;
        
        try {
            const response = await axios.get("https://api-faa.my.id/faa/iqc", {
                params: { prompt },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            const buffer = Buffer.from(response.data);
            const isImage = response.headers['content-type']?.includes('image');
            const firstBytes = buffer.slice(0, 50).toString('hex');
            const firstChars = buffer.slice(0, 100).toString();
            
            return res.json({
                status: true,
                apiStatus: 'WORKING',
                isImage: isImage,
                contentType: response.headers['content-type'],
                size: buffer.length,
                firstBytesPattern: firstBytes,
                detected: firstChars.includes('{') ? 'JSON' : 'BINARY_IMAGE',
                headers: response.headers,
                message: 'API eksternal berfungsi dengan baik'
            });
            
        } catch (error) {
            return res.json({
                status: false,
                apiStatus: 'ERROR',
                error: error.message,
                code: error.code
            });
        }
    });
    
    // Health check endpoint
    app.get("/imagecreator/iqc/health", (req, res) => {
        res.json({
            status: true,
            endpoint: "/imagecreator/iqc",
            method: "GET",
            parameters: {
                prompt: "string (required)"
            },
            response_format: "JSON with base64 image",
            compatible_with: "PreviewHandler.handleBase64Image()",
            timestamp: new Date().toISOString()
        });
    });
};