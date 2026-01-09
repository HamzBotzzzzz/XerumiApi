const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function getRandomUA() {
    try {
        const file = path.join(__dirname, './ua.txt')
        if (fs.existsSync(file)) {
            const lines = fs.readFileSync(file, 'utf-8')
                .split('\n')
                .filter(line => line.trim() !== '')
            if (lines.length > 0) {
                return lines[Math.floor(Math.random() * lines.length)].trim()
            }
        }
    } catch (error) {
        console.error('Error reading ua.txt:', error.message)
    }
    
    return 'Mozilla/5.0 (Linux; Android 10)'
}

async function twitterstalk(username){
    try{
        if(!username) throw new Error('username required')

        const ua = getRandomUA()
        
        const ch = await axios.get(
            'https://twittermedia.b-cdn.net/challenge/',
            {
                headers:{
                    'User-Agent': ua,
                    'Accept':'application/json',
                    origin:'https://snaplytics.io',
                    referer:'https://snaplytics.io/'
                }
            }
        ).then(function(r){ return r.data })

        if(!ch.challenge_id) throw new Error('challange failed')

        const hash = crypto
            .createHash('sha256')
            .update(String(ch.timestamp) + ch.random_value)
            .digest('hex')
            .slice(0,8)

        const result = await axios.get(
            'https://twittermedia.b-cdn.net/viewer/?data=' + username + '&type=profile',
            {
                headers:{
                    'User-Agent': ua,
                    'Accept':'application/json',
                    origin:'https://snaplytics.io',
                    referer:'https://snaplytics.io/',
                    'X-Challenge-ID':ch.challenge_id,
                    'X-Challenge-Solution':hash
                }
            }
        ).then(function(r){
            if(!r.data || !r.data.profile) throw new Error('no data')
            return r.data.profile
        })

        return {
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        }

    }catch(e){
        return { 
            success: false,
            message: e.message 
        }
    }
}

module.exports = function(app) {
    app.get("/stalk/twitter", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await twitterstalk(username);
            
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
                    message: result.message || "Gagal mengambil data Twitter"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Twitter"
            });
        }
    });
};