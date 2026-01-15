const axios = require('axios')
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

async function ttstalk(username){
    try{
        if(!username) throw Error('username required')

        const html = await axios.get(
            'https://www.tiktok.com/@' + username,
            {
                headers:{
                    'User-Agent': getRandomUA(),
                    'Accept':'text/html'
                }
            }
        ).then(r => r.data)

        const pick = function(re){
            const m = html.match(re)
            return m ? m[1] : null
        }

        const result = {
            username : pick(/"uniqueId":"([^"]+)"/),
            name : pick(/"nickname":"([^"]+)"/),
            bio : pick(/"signature":"([^"]*)"/),
            followers : pick(/"followerCount":(\d+)/),
            following : pick(/"followingCount":(\d+)/),
            likes : pick(/"heartCount":(\d+)/),
            videoCount : pick(/"videoCount":(\d+)/),
            avatar : pick(/"avatarLarger":"([^"]+)"/)?.replace(/\\u002F/g,'/')
        }

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
    app.get("/stalk/tiktok", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await ttstalk(username);
            
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
                    message: result.message || "Gagal mengambil data TikTok"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data TikTok"
            });
        }
    });
};