const crypto = require('crypto');

// Generate device ID
const generateDeviceId = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Register function
async function registerElinAI(email, password) {
    const url = "https://api.elin.ai/api/v1/users/register";
    const deviceId = generateDeviceId();
    
    const headers = {
        'User-Agent': 'Elin AI/2.8.0 (ai.elin.app.android; build:220; Android 15; Model:25028RN03A)',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
        'accept-language': 'en',
        'x-timezone': 'Asia/Jakarta',
        'accept-charset': 'UTF-8'
    };

    const payload = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.status === 200 || response.status === 201) {
            const data = await response.json();

            if (data.is_active === true) {
                return {
                    success: true,
                    message: "Registrasi Berhasil!",
                    data: {
                        id: data.id || 'N/A',
                        email: data.email || 'N/A',
                        created: data.created || 'N/A',
                        deviceId: deviceId
                    }
                };
            } else {
                return {
                    success: false,
                    message: "Akun dibuat tapi status tidak aktif"
                };
            }
        } else {
            try {
                const errData = await response.json();
                return {
                    success: false,
                    message: errData.detail || "Gagal Mendaftar"
                };
            } catch {
                return {
                    success: false,
                    message: "Gagal Mendaftar"
                };
            }
        }
    } catch (error) {
        return {
            success: false,
            message: "Terjadi kesalahan koneksi"
        };
    }
}

// Routes - GET method
module.exports = function(app) {
    // GET /ai/elinai - Register account via query params
    app.get("/ai/elinai", async (req, res) => {
        const { email, password } = req.query;
        
        if (!email) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'email' wajib diisi."
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'password' wajib diisi."
            });
        }

        try {
            const result = await registerElinAI(email, password);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.data
                });
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal membuat akun"
                });
            }
            
        } catch (error) {
            console.error('Register Error:', error);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal membuat akun Elin AI"
            });
        }
    });

    // POST endpoint juga tersedia untuk fleksibilitas (optional)
    app.post("/ai/elinai", async (req, res) => {
        const { email, password } = req.body;
        
        if (!email) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'email' wajib diisi."
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'password' wajib diisi."
            });
        }

        try {
            const result = await registerElinAI(email, password);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.data
                });
            } else {
                return res.status(400).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal membuat akun"
                });
            }
            
        } catch (error) {
            console.error('Register Error:', error);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal membuat akun Elin AI"
            });
        }
    });
};