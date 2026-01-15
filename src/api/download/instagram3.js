const axios = require("axios"); 
const qs = require("qs"); 

function extract(html) { 
    const clean = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\'); 
    const r = /https:\/\/cdn\.downloadgram\.app\/\?token=[^"'\\]+/g; 
    return [...new Set(clean.match(r) || [])]; 
} 

function downloadgram(url) { 
    return axios.post(
        "https://api.downloadgram.app/media",
        qs.stringify({ url }),
        {
            headers: {
                "user-agent": "Mozilla/5.0",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                origin: "https://www.downloadgram.app",
                referer: "https://www.downloadgram.app/download"
            }
        }
    ).then(r => {
        const media = extract(typeof r.data === "string" ? r.data : "");
        return {
            success: media.length > 0,
            count: media.length,
            media
        };
    });
}

module.exports = function(app) {
    app.get("/download/instagram3", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await downloadgram(url);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    count: result.count,
                    result: result.media
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: "Tidak ada media yang ditemukan"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendownload dari Instagram"
            });
        }
    });
};