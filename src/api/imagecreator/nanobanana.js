const axios = require('axios')
const FormData = require('form-data')
const crypto = require('crypto')

const API = 'https://www.createimg.com/?api=v1'
const headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    origin: 'https://www.createimg.com',
    referer: 'https://www.createimg.com/'
}

class createimg {
    async uplod(buffer, filename = 'zenn.png') {
        const form = new FormData()
        form.append('files[]', buffer, filename)
        const { data } = await axios.post('https://uguu.se/upload', form, { headers: form.getHeaders() })
        return data.files[0].url
    }
    
    async post(body, extraHeaders = {}) {
        const { data } = await axios.post(API, body, { headers: { ...headers, ...extraHeaders } })
        return data
    }
    
    async run(module, prompt) {
        if (!prompt) throw new Error('prompt is required')
        
        const token = crypto.randomBytes(32).toString('hex')
        const security = crypto.randomUUID()
        
        const turnstile = await this.post(new URLSearchParams({
            token, 
            security, 
            action: 'turnstile', 
            module
        }).toString())
        
        if (!turnstile?.status) throw new Error('turnstile failed')
        
        const { server, size } = turnstile
        
        const create = await this.post(new URLSearchParams({
            token, 
            security, 
            action: module, 
            server, 
            prompt, 
            negative: '', 
            seed: Math.floor(Math.random() * 2147483647), 
            size
        }).toString())
        
        if (!create?.id) throw new Error('failed to create task')
        
        const taskId = create.id
        let queueId = create.queue
        
        while (true) {
            await new Promise(r => setTimeout(r, 3000))
            const q = await this.post(new URLSearchParams({
                id: taskId, 
                queue: queueId, 
                action: 'queue', 
                module, 
                server, 
                token, 
                security
            }).toString())
            if (q?.pending === 0) break
        }
        
        const history = await this.post(new URLSearchParams({
            id: taskId, 
            action: 'history', 
            module, 
            server, 
            token, 
            security
        }).toString())
        
        const output = await this.post(new URLSearchParams({
            id: history.file, 
            action: 'output', 
            module, 
            server, 
            token, 
            security, 
            page: 'home', 
            lang: 'en'
        }).toString())
        
        const buffer = Buffer.from(output.data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        return this.uplod(buffer)
    }
    
    create(prompt) {
        return this.run('create', prompt)
    }
}

async function nanobanana(prompt) {
    try {
        if (!prompt) throw new Error('Prompt diperlukan');
        
        const c = new createimg();
        const result = await c.create(prompt);
        
        return {
            success: true,
            result: result,
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
    app.get("/imagecreator/nanobanana", async (req, res) => {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        try {
            const result = await nanobanana(prompt);
            
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
                    message: result.message || "Gagal membuat gambar"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal membuat gambar"
            });
        }
    });
};