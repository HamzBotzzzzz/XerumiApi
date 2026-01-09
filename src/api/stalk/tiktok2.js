const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")
const { CookieJar } = require("tough-cookie")
const { wrapper } = require("axios-cookiejar-support")

const jar = new CookieJar()
const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "*/*"
    }
}))

async function getUserProfile(username) {
    try {
        const page = await client.get("https://on4t.com/tiktok-viewer")
        const $ = cheerio.load(page.data)
        const csrf = $('meta[name="csrf-token"]').attr("content")

        if (!csrf) {
            throw new Error("CSRF token tidak ditemukan")
        }

        const payload = qs.stringify({
            userName: username
        })

        const res = await client.post(
            "https://on4t.com/GetUserProfile",
            payload,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    "Origin": "https://on4t.com",
                    "Referer": "https://on4t.com/tiktok-viewer"
                }
            }
        )

        return res.data
    } catch (error) {
        throw new Error(error.response?.data || error.message)
    }
}

module.exports = function(app) {
    app.get("/stalk/tiktok2", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await getUserProfile(username);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data TikTok"
            });
        }
    });
};