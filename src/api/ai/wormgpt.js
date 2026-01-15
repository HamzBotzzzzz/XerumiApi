const axios = require('axios')

function generateRandomId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)]
    
    const rand = (n) => Array.from({ length: n }, randomChar).join('')
    const messageId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`
    const userId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`
    
    return { messageId, userId }
}

async function chatAiBaik(prompt) {
    const { messageId, userId } = generateRandomId()
    
    const cookie = '__Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiRnlESjQ1UXFQeDVRSVhoaVNSQk5uNFBHcFBFVnQzbjBZTVhRVGlEZ3hNeS1KaEZCNTJQOWx6d0lvNTRIODU1X3JNVzhWTHE0UUVDUExTWF9aLTh2aXcifQ..BC1-RXYYZM0oVmP7FaXUsw.f5LshHBNgG24G0uaj9te9vcDqm7zynNtVRvuuFjiHJzChQHQ4TYDCG35JXFCtiy29JcTWULM3ynjMp9l3ygwnv4FVIo9BIZBcyUQBzFyPNYcF6FGQEYke-D5ebIXcQi_tXLbxkhLTh9jTJJ4qfqZC13CgeaG-8je-x_dLT7yDe7A0s9QYqk7edr0YT_AmngvgS3MvcvhNmVC35aDurZO3dV2egpNvwgjlJaCn3aNRoiXjmtZow8pX3BUig8pfdE1.TiCtK3B8lnk4_K7R9ZxQvjqd3SVeoBzEUr8V9BKjGN0; __Secure-authjs.callback-url=https%3A%2F%2Fchat.wrmgpt.com%2Flogin'

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://chat.wrmgpt.com',
        'Referer': 'https://chat.wrmgpt.com/',
        'Cookie': cookie,
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-mobile': '?1'
    }

    const data = {
        id: messageId,
        message: {
            role: 'user',
            parts: [{ type: 'text', text: prompt }],
            id: userId
        },
        selectedChatModel: 'wormgpt-v5.5',
        selectedVisibilityType: 'private',
        searchEnabled: false,
        memoryLength: 8
    }

    try {
        const response = await axios.post('https://chat.wrmgpt.com/api/chat', data, {
            headers: headers,
            responseType: 'stream'
        })

        let result = ''
        
        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n')
                
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue

                    const dataStr = line.slice(6).trim()
                    if (dataStr === '[DONE]') break

                    try {
                        const json = JSON.parse(dataStr)
                        if (json.type === 'text-delta' && json.delta) {
                            result += json.delta
                        }
                    } catch (e) {}
                }
            })

            response.data.on('end', () => {
                if (!result) {
                    reject(new Error('No output content generated'))
                } else {
                    resolve({ success: true, response: result })
                }
            })

            response.data.on('error', (err) => {
                reject(err)
            })
        })

    } catch (error) {
        return { success: false, message: 'Gagal melakukan chat' }
    }
}

module.exports = function(app) {
    app.get("/ai/aibaik", async (req, res) => {
        const { prompt } = req.query
        
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            })
        }

        try {
            const result = await chatAiBaik(prompt)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: {
                        response: result.response
                    }
                })
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal melakukan chat"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan chat AiBaik"
            })
        }
    })
}