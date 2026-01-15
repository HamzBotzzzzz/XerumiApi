const axios = require('axios');

class DevianArt {
    constructor() {
        this.inst = axios.create({
            baseURL: 'https://www.deviantart.com',
            headers: {
                origin: 'https://www.deviantart.com',
                referer: 'https://www.deviantart.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
    }
    
    getCsrf = async function () {
        try {
            const { data: html, headers } = await this.inst.get('/');
            
            const csrf = html.match(/window\.__CSRF_TOKEN__\s*=\s*'([^']*)'/)?.[1];
            if (!csrf) throw new Error('Failed to get csrf token.');
            
            const cookies = headers['set-cookie']?.join('; ') || '';
            this.inst.defaults.headers.common['cookie'] = cookies;
            
            return csrf;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    search = async function ({ query, cursor } = {}) {
        try {
            if (!query) throw new Error('Query is required.');
            
            const csrf = await this.getCsrf();
            const { data } = await this.inst.get('/_puppy/dabrowse/search/all', {
                params: {
                    q: query,
                    da_minor_version: 20230710,
                    csrf_token: csrf,
                    ...(cursor && { cursor: cursor })
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = function(app) {
    const d = new DevianArt();
    
    app.get("/random/devianart", async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' wajib diisi."
            });
        }

        try {
            const result = await d.search({ query });
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari di DevianArt"
            });
        }
    });
};