const axios = require('axios');

class RevidScraper {
    constructor() {
        this.baseUrl = 'https://us-central1-execbrief-31c27.cloudfunctions.net';
        this.session = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://www.revid.ai',
                'Referer': 'https://www.revid.ai/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });
    }

    async searchTikTok(keyword) {
        try {
            const params = new URLSearchParams({
                keywords: keyword,
                filtersFast: "lang = 'en',nbChar > 10",
                sort: "",
                uid: "undefined"
            });

            const url = `${this.baseUrl}/tiktokSearch-search?${params.toString()}`;
            
            const response = await this.session.get(url);
            
            if (response.data && response.data.videos) {
                let videos = response.data.videos;
                
                videos = videos.filter(v => v.diggCount >= 1000);
                
                videos = videos.filter(v => v.commentCount >= 1);
                
                videos = videos.slice(0, 10);
                
                return {
                    success: true,
                    result: videos,
                    count: videos.length
                };
            }
            
            return {
                success: false,
                message: 'Tidak ada video ditemukan'
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = function(app) {
    const scraper = new RevidScraper();
    
    app.get("/search/tiktok2", async (req, res) => {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'keyword' wajib diisi."
            });
        }

        try {
            const result = await scraper.searchTikTok(keyword);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    count: result.count,
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mencari video TikTok"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mencari video TikTok"
            });
        }
    });
};