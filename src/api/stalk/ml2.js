const axios = require('axios')

async function cekMobileLegends(userId, zoneId) {
    const url = 'https://api.naimstore.id/api/stack-ml'
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://naimstore.id/stalk-ml',
        'cache-control': 'no-cache, private'
    }
    const data = {
        user_id: userId,
        zone_id: zoneId
    }

    try {
        const response = await axios.post(url, data, { headers })
        
        if (response.data.status && response.data.data) {
            const user = response.data.data
            return {
                success: true,
                game: 'Mobile Legends',
                id: userId,
                zone: zoneId,
                nickname: user.nick,
                region: user.region
            }
        } else {
            return { success: false, message: 'Not found' }
        }
    } catch (error) {
        return { success: false, message: 'Failed to fetch data' }
    }
}

module.exports = function(app) {
    app.get("/stalk/ml2", async (req, res) => {
        const { user_id, zone_id } = req.query
        
        if (!user_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'user_id' wajib diisi."
            })
        }

        if (!zone_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'zone_id' wajib diisi."
            })
        }

        try {
            const result = await cekMobileLegends(userId, zoneId)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result
                })
            } else {
                return res.status(404).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "User tidak ditemukan"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Mobile Legends"
            })
        }
    })
}