const axios = require('axios')
const vm = require('vm')
const https = require('https')

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

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const data = []
            res.on('data', chunk => data.push(chunk))
            res.on('end', () => resolve(Buffer.concat(data)))
            res.on('error', reject)
        }).on('error', reject)
    })
}

const WORKER_URL = 'https://static.deepseek.com/chat/static/33614.25c7f8f220.js'
const WASM_URL = 'https://static.deepseek.com/chat/static/sha3_wasm_bg.7b9ca65ddd.wasm'

let workerCache = null
let wasmCache = null

async function loadAssets() {
    if (!workerCache) workerCache = (await download(WORKER_URL)).toString()
    if (!wasmCache) wasmCache = await download(WASM_URL)
    return { workerScript: workerCache, wasmBuffer: wasmCache }
}

function generateFinalToken(originalPayload, answer) {
    const jsonBody = {
        algorithm: originalPayload.algorithm,
        challenge: originalPayload.challenge,
        salt: originalPayload.salt,
        answer: answer,
        signature: originalPayload.signature,
        target_path: originalPayload.target_path
    }
    return Buffer.from(JSON.stringify(jsonBody)).toString('base64')
}

async function solvePow(payload) {
    const cleanPayload = {
        algorithm: payload.algorithm,
        challenge: payload.challenge,
        salt: payload.salt,
        difficulty: payload.difficulty,
        signature: payload.signature,
        expireAt: payload.expire_at || payload.expireAt
    }

    const { workerScript, wasmBuffer } = await loadAssets()

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('PoW timeout'))
        }, 60000)

        class MockResponse {
            constructor(buffer) {
                this.buffer = buffer
                this.ok = true
                this.status = 200
                this.headers = { get: () => 'application/wasm' }
            }
            async arrayBuffer() { return this.buffer }
        }

        const sandbox = {
            console: { log: () => {} },
            setTimeout, clearTimeout, setInterval, clearInterval,
            TextEncoder, TextDecoder, URL,
            Response: MockResponse,
            location: {
                href: WORKER_URL,
                origin: 'https://static.deepseek.com',
                pathname: '/chat/static/33614.25c7f8f220.js',
                toString: () => WORKER_URL
            },
            WebAssembly: {
                Module: WebAssembly.Module,
                Instance: WebAssembly.Instance,
                instantiate: WebAssembly.instantiate,
                validate: WebAssembly.validate,
                Memory: WebAssembly.Memory,
                Table: WebAssembly.Table,
                Global: WebAssembly.Global,
                CompileError: WebAssembly.CompileError,
                LinkError: WebAssembly.LinkError,
                RuntimeError: WebAssembly.RuntimeError
            },
            fetch: async (input) => {
                if (input.toString().includes('wasm')) return new MockResponse(wasmBuffer)
                throw new Error("Blocked")
            },
            postMessage: (msg) => {
                if (msg && msg.type === 'pow-answer') {
                    clearTimeout(timeoutId)
                    resolve(generateFinalToken(payload, msg.answer.answer))
                } else if (msg && msg.type === 'pow-error') {
                    clearTimeout(timeoutId)
                    reject(new Error('POW worker error: ' + JSON.stringify(msg.error)))
                }
            }
        }

        sandbox.self = sandbox
        sandbox.window = sandbox
        sandbox.globalThis = sandbox

        const context = vm.createContext(sandbox)
        
        try {
            vm.runInContext(workerScript, context)
            setTimeout(() => {
                if (sandbox.onmessage) {
                    sandbox.onmessage({ data: { type: "pow-challenge", challenge: cleanPayload } })
                } else if (sandbox.self && sandbox.self.onmessage) {
                    sandbox.self.onmessage({ data: { type: "pow-challenge", challenge: cleanPayload } })
                } else {
                    reject(new Error('Worker tidak memiliki handler onmessage'))
                }
            }, 1000)
        } catch (e) {
            clearTimeout(timeoutId)
            reject(e)
        }
    })
}

async function getPowToken(token, targetPath) {
    try {
        const response = await axios.post(`${CONFIG.BASE_URL}/chat/create_pow_challenge`, 
            { target_path: targetPath }, 
            { headers: { ...CONFIG.HEADERS, 'Authorization': `Bearer ${token}` } }
        )
        const challengeData = response.data.data.biz_data.challenge
        return await solvePow(challengeData)
    } catch (e) {
        return null
    }
}

async function chatDeepSeek(token, prompt) {
    try {
        const sessionRes = await axios.post(`${CONFIG.BASE_URL}/chat_session/create`, {}, {
            headers: { ...CONFIG.HEADERS, 'Authorization': `Bearer ${token}` },
            timeout: 10000
        })
        
        if (sessionRes.data.code !== 0) {
            return { success: false, message: 'Gagal create session' }
        }
        
        const sessionId = sessionRes.data.data.biz_data.id
        
        const powToken = await getPowToken(token, '/api/v0/chat/completion')
        if (!powToken) {
            return { success: false, message: 'Gagal solve PoW' }
        }

        const payload = {
            chat_session_id: sessionId,
            parent_message_id: null,
            prompt: prompt,
            ref_file_ids: [],
            thinking_enabled: false,
            search_enabled: false,
            audio_id: null
        }

        const response = await axios.post(`${CONFIG.BASE_URL}/chat/completion`, payload, {
            headers: {
                ...CONFIG.HEADERS,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-ds-pow-response': powToken
            },
            responseType: 'stream',
            timeout: 60000
        })

        return new Promise((resolve, reject) => {
            let fullText = ''
            let buffer = ''

            response.data.on('data', (chunk) => {
                buffer += chunk.toString()
                const lines = buffer.split('\n\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const dataStr = line.replace('data: ', '').trim()
                            if (dataStr === '[DONE]') break
                            const parsed = JSON.parse(dataStr)
                            
                            if (parsed.content && typeof parsed.content === 'string') {
                                fullText += parsed.content
                            } else if (parsed.v && typeof parsed.v === 'string') {
                                fullText += parsed.v
                            }
                        } catch (e) {}
                    }
                }
            })

            response.data.on('end', () => {
                resolve({
                    success: true,
                    response: fullText.trim()
                })
            })
            
            response.data.on('error', (err) => {
                reject({ success: false, message: 'Gagal mendapatkan response' })
            })
        })

    } catch (error) {
        return { success: false, message: 'Gagal melakukan chat' }
    }
}

module.exports = function(app) {
    app.get("/ai/deepseek/chat", async (req, res) => {
        const { token, prompt } = req.query
        
        if (!token) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'token' wajib diisi."
            })
        }

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            })
        }

        try {
            const result = await chatDeepSeek(token, prompt)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: {
                        response: result.response
                    }
                })
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal melakukan chat"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan chat DeepSeek"
            })
        }
    })
}