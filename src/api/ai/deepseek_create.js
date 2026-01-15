const axios = require('axios')
const crypto = require('crypto')

const CONFIG = {
    BASE_URL: "https://chat.deepseek.com/api/v0",
    HEADERS: {
        'User-Agent': 'DeepSeek/1.6.4 Android/35',
        'Accept': 'application/json',
        'x-client-platform': 'android',
        'x-client-version': '1.6.4',
        'x-client-locale': 'id',
        'x-client-bundle-id': 'com.deepseek.chat',
        'x-rangers-id': '7392079989945982465',
        'accept-charset': 'UTF-8'
    }
}

function generateDeviceId() {
    const baseId = "BUelgEoBdkHyhwE8q/4YOodITQ1Ef99t7Y5KAR4CyHwdApr+lf4LJ+QAKXEUJ2lLtPQ+mmFtt6MpbWxpRmnWITA=="
    let chars = baseId.split('')
    const start = 50
    const end = 70
    const changes = Math.floor(Math.random() * 3) + 2
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (let i = 0; i < changes; i++) {
        const randomIndex = Math.floor(Math.random() * (end - start)) + start
        chars[randomIndex] = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    }
    return chars.join('')
}

async function createDeepSeekAccount(email, password) {
    try {
        const deviceId = generateDeviceId()
        
        const response = await axios.post(`${CONFIG.BASE_URL}/users/login`, {
            email: email, 
            password: password, 
            device_id: deviceId, 
            os: 'android'
        }, { 
            headers: CONFIG.HEADERS,
            timeout: 10000 
        })

        if (response.data.code !== 0) {
            return { success: false, message: response.data.msg || 'Unknown error' }
        }
        
        if (response.data.data && response.data.data.biz_code === 2) {
            return { success: false, message: 'Email atau password salah' }
        }
        
        if (response.data.data && response.data.data.biz_data && response.data.data.biz_data.user) {
            const userData = response.data.data.biz_data.user
            return {
                success: true,
                token: userData.token,
                deviceId: deviceId
            }
        }
        
        return { success: false, message: 'Struktur response tidak valid' }
        
    } catch (error) {
        return { success: false, message: 'Gagal membuat akun' }
    }
}

module.exports = function(app) {
    app.get("/ai/deepseek/create", async (req, res) => {
        const { email, password } = req.query
        
        if (!email) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'email' wajib diisi."
            })
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'password' wajib diisi."
            })
        }

        try {
            const result = await createDeepSeekAccount(email, password)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: {
                        token: result.token,
                        deviceId: result.deviceId
                    }
                })
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal membuat akun"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal membuat akun DeepSeek"
            })
        }
    })
}