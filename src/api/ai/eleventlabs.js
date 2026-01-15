const axios = require('axios');

async function elevenlabs(text, model) {
    return new Promise(async (resolve, reject) => {
        try {
            // Voice models mapping
            const voiceModels = {
                'rachel': { id: '21m00Tcm4TlvDq8ikWAM', status: true },
                'domi': { id: 'AZnzlk1XvdvUeBnXmlld', status: true },
                'bella': { id: 'EXAVITQu4vr4xnSDxMaL', status: true },
                'antoni': { id: 'ErXwobaYiN019PkySvjV', status: true },
                'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', status: true },
                'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', status: true },
                'arnold': { id: 'VR6AewLTigWG4xSOukaG', status: true },
                'adam': { id: 'pNInz6obpgDQGcFmaJgB', status: true },
                'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', status: true }
            };
            
            const voice = voiceModels[model] || voiceModels['rachel'];
            
            if (!voice.status) {
                return resolve({ status: false, message: "Voice model tidak ditemukan" });
            }
            
            const response = await axios.post(
                "https://api.elevenlabs.io/v1/text-to-speech/" + voice.id + "/stream",
                {
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                },
                {
                    headers: {
                        'accept': 'audio/mpeg',
                        'xi-api-key': 'api-key-disini', // Ganti dengan API key Anda
                        'content-type': 'application/json',
                        'origin': 'https://elevenlabs.io',
                        'referer': 'https://elevenlabs.io/',
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
                    },
                    responseType: "arraybuffer"
                }
            );
            
            const buffer = Buffer.from(response.data);
            resolve(buffer);
            
        } catch (error) {
            reject(new Error(error.message));
        }
    });
}

module.exports = function(app) {
    app.get("/ai/elevenlabs", async (req, res) => {
        const { text, model } = req.query;
        
        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'text' wajib diisi."
            });
        }

        try {
            const result = await elevenlabs(text, model || 'rachel');
            
            // Return audio as base64
            const base64Audio = result.toString('base64');
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: {
                    audio: base64Audio,
                    format: 'audio/mpeg',
                    model: model || 'rachel',
                    text_length: text.length
                }
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengkonversi teks ke suara dengan ElevenLabs"
            });
        }
    });
    
    // Endpoint untuk mendapatkan daftar voice models
    app.get("/ai/elevenlabs/models", async (req, res) => {
        try {
            const voiceModels = {
                'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', desc: 'Suara wanita dewasa yang jelas' },
                'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', desc: 'Suara wanita yang bersemangat' },
                'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', desc: 'Suara wanita lembut' },
                'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', desc: 'Suara pria yang hangat' },
                'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', desc: 'Suara wanita muda' },
                'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', desc: 'Suara pria dewasa' },
                'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', desc: 'Suara pria yang dalam' },
                'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', desc: 'Suara pria netral' },
                'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', desc: 'Suara pria profesional' }
            };
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: voiceModels
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan daftar model"
            });
        }
    });
};