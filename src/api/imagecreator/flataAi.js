const axios = require('axios')

const STYLES = {
    flataipro: 'Flat AI Pro',
    flatai: 'Flat AI Base',
    runware_quality: 'Standard',
    runware_new_quality: 'Quality+',
    realistic: 'Realistic',
    photo_skin: 'Real Skin',
    cinema: 'Cinematic',
    retro_anime: 'Retro Anime',
    'ghibli-style': 'Ghibli Style',
    midjourney_art: 'Midjourney Art',
    fantasy_armor: 'Fantasy Armor',
    robot_cyborg: 'Robot & Cyborg',
    disney_princess: 'Princess',
    amateurp: 'Daily Life',
    scifi_enviroments: 'Sci-Fi Environments',
    mythic_fantasy: 'Mythic Fantasy',
    pixel_art: 'Pixel Art',
    watercolor_painting: 'Watercolor Painting',
    diesel_punk: 'Diesel Punk',
    architectural: 'Architectural',
    style_1930s: '1930s',
    flat_anime: 'Flat Anime',
    mystical_realms: 'Mystical Realms',
    ecommerce: 'E-Commerce',
    cinema_style: 'Cinema'
}

async function getNonce() {
    const { data } = await axios.get('https://flatai.org/ai-image-generator-free-no-signup/')
    const nonce = data.match(/ai_generate_image_nonce["']\s*:\s*["']([a-f0-9]{10})["']/i)?.[1] || data.match(/"nonce"\s*:\s*"([a-f0-9]{10})"/i)?.[1]
    if (!nonce) throw new Error('nonce not found')
    return nonce
}

async function flatai(prompt, style = 'ghibli-style', { aspect_ratio = '1:1', seed = Math.floor(Math.random() * 4294967295) } = {}) {
    if (!STYLES[style]) {
        throw new Error('Style tidak valid')
    }
    
    const nonce = await getNonce()
    const headers = {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        origin: 'https://flatai.org',
        referer: 'https://flatai.org/ai-image-generator-free-no-signup/'
    }
    
    const body = new URLSearchParams({
        action: 'ai_generate_image',
        nonce,
        prompt,
        aspect_ratio,
        seed,
        style_model: style
    }).toString()
    
    const res = await axios.post('https://flatai.org/wp-admin/admin-ajax.php', body, { headers })
    
    if (!res.data?.success) {
        throw new Error(res.data?.data?.message || 'generate gagal')
    }
    
    return {
        success: true,
        result: {
            style: style,
            style_name: STYLES[style],
            prompt: res.data.data.prompt,
            seed: res.data.data.seed,
            images: res.data.data.images
        },
        timestamp: new Date().toISOString()
    }
}

module.exports = function(app) {
    app.get("/imagecreator/flataAi", async (req, res) => {
        const { prompt, style = 'ghibli-style', aspect_ratio = '1:1', seed } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        try {
            const options = {
                aspect_ratio: aspect_ratio,
                seed: seed ? parseInt(seed) : Math.floor(Math.random() * 4294967295)
            };
            
            const result = await flatai(prompt, style, options);
            
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
                message: error.message || "Gagal membuat gambar dengan Flat AI"
            });
        }
    });
};