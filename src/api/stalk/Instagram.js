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

async function igstalk(username) {
    try {
        if (!username) throw new Error('username required')

        const response = await axios.post(
            'https://api.boostfluence.com/api/instagram-profile-v2',
            { username },
            {
                headers: {
                    'User-Agent': getRandomUA(),
                    'Content-Type': 'application/json',
                    'origin': 'https://www.boostfluence.com',
                    'referer': 'https://www.boostfluence.com/'
                },
                timeout: 60000
            }
        )

        if (!response.data) {
            throw new Error('fetch failed')
        }

        return {
            success: true,
            result: response.data,
            timestamp: new Date().toISOString()
        }

    } catch (e) {
        console.error('Instagram stalk error:', e.message)
        return {
            success: false,
            message: e.message || 'Failed to fetch Instagram profile',
            error: e.message
        }
    }
}

module.exports = function(app) {
    app.get("/stalk/ig", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await igstalk(username);
            
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
                    message: result.message
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Instagram"
            });
        }
    });
};