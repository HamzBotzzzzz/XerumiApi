const axios = require('axios');
const qs = require('qs');

// Chat function
async function chatElinAI(username, password, prompt, chatId = null) {
    const BASE_URL = "https://api.elin.ai";
    const HEADERS = {
        'User-Agent': 'Elin AI/2.8.0 (ai.elin.app.android; build:220; Android 15; Model:25028RN03A)',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'x-device-id': '540e28659b22cf05',
        'accept-language': 'en',
        'x-timezone': 'Asia/Jakarta',
        'accept-charset': 'UTF-8'
    };

    try {
        // Login to get token
        const loginData = qs.stringify({ 
            username: username, 
            password: password 
        });
        
        const loginRes = await axios.post(
            BASE_URL + "/api/v1/auth/token", 
            loginData, 
            {
                headers: {
                    ...HEADERS,
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                timeout: 10000
            }
        );
        
        const token = loginRes.data?.access_token;
        if (!token) {
            throw new Error("Gagal login: Token tidak valid");
        }

        const authHeaders = {
            ...HEADERS,
            'authorization': `Bearer ${token}`
        };

        // Create new chat session if not provided
        if (!chatId) {
            const sessionRes = await axios.get(
                BASE_URL + "/api/v3/chats/sessions/id", 
                { 
                    headers: authHeaders,
                    timeout: 10000
                }
            );
            chatId = sessionRes.data?.id;
            if (!chatId) {
                throw new Error("Gagal membuat session ID baru");
            }
        }

        // Prepare chat payload
        const payload = {
            id: chatId,
            messages: [{
                type: "user",
                order: 1,
                timestamp: new Date().toISOString(),
                context: {},
                content: {
                    type: "text",
                    content: prompt
                }
            }],
            type: "generic",
            overrides: { retry: false }
        };

        // Send chat request with streaming
        const chatRes = await axios.post(
            BASE_URL + `/api/v3/chats/${chatId}/stream`, 
            payload, 
            {
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream',
                timeout: 30000
            }
        );

        // Process streaming response
        return new Promise((resolve, reject) => {
            let fullData = '';
            chatRes.data.on('data', (chunk) => {
                fullData += chunk.toString();
            });
            
            chatRes.data.on('end', () => {
                const lines = fullData.split('\n');
                let finalContent = "";
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.replace('data: ', '').trim();
                            if (jsonStr === '[DONE]') break;
                            
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.content && parsed.content.type === 'markdown') {
                                finalContent = parsed.content.content;
                            }
                        } catch (e) {
                            // Skip parsing errors
                        }
                    }
                }
                
                resolve({
                    success: true,
                    chatId: chatId,
                    response: finalContent || "Tidak ada respon teks."
                });
            });

            chatRes.data.on('error', (err) => {
                reject(new Error(`Stream error: ${err.message}`));
            });
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        
        if (error.response) {
            return {
                success: false,
                message: `Server Error (${error.response.status}): ${error.response.data?.detail || 'Unknown error'}`
            };
        } else if (error.request) {
            return {
                success: false,
                message: "Tidak ada respons dari server"
            };
        } else {
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
}

// Routes - GET method
module.exports = function(app) {
    // GET /ai/elinai/chat - Chat with AI via query params
    app.get("/ai/elinai/chat", async (req, res) => {
        const { username, password, prompt, chat_id } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'password' wajib diisi."
            });
        }

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        try {
            const result = await chatElinAI(username, password, prompt, chat_id);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: {
                        chatId: result.chatId,
                        response: result.response
                    }
                });
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal melakukan chat"
                });
            }
            
        } catch (error) {
            console.error('Chat Endpoint Error:', error);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan chat dengan Elin AI"
            });
        }
    });

    // POST endpoint juga tersedia (optional)
    app.post("/ai/elinai/chat", async (req, res) => {
        const { username, password, prompt, chat_id } = req.body;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'password' wajib diisi."
            });
        }

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'prompt' wajib diisi."
            });
        }

        try {
            const result = await chatElinAI(username, password, prompt, chat_id);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: {
                        chatId: result.chatId,
                        response: result.response
                    }
                });
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal melakukan chat"
                });
            }
            
        } catch (error) {
            console.error('Chat Endpoint Error:', error);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan chat dengan Elin AI"
            });
        }
    });
};