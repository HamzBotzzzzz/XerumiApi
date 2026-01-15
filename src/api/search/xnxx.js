const axios = require("axios");

const xnxxScraper = {
    search: async (userQuery) => {
        try {
            // Encode keyword biar aman di URL 😈
            const encodedKeyword = encodeURIComponent(userQuery);
            const url = `https://www.xnxx.com/euto/play/straight`;
            const payload = `keywords=${encodedKeyword}`;
            
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const rawData = response.data;
            
            if (rawData.result && rawData.data && rawData.data.b) {
                // Ambil 5 data teratas aja (4-5 biji) ☠️
                const limitedData = rawData.data.b.slice(0, 5);

                return limitedData.map(item => {
                    // Ekstrak ID dari link_url buat nyari direct link kalo perlu
                    const roomName = item.name;
                    
                    return {
                        title: roomName,
                        thumb: item.img_url,
                        // Link Direct Stream (Biasanya Chaturbate pake HLS)
                        direct_link: `https://chaturbate.com/get_edge_hls_url_ajax/?room_name=${roomName}&network=main`,
                        page_url: `https://www.xnxx.com${item.link_url}`,
                        iframe_src: item.iframe.match(/src='(.*?)'/)?.[1] || null,
                        score: item.score
                    };
                });
            } else {
                return [];
            }
        } catch (error) {
            throw new Error("Gagal sikat link! Server lagi rewel 😈 " + error.message);
        }
    }
};

module.exports = function (app) {
    app.get('/search/xnxx', async (req, res) => {
        const { q } = req.query; // Ambil keyword dari input user misal: ?q=asian
        
        if (!q) {
            return res.status(400).json({ 
                status: false, 
                message: "Masukin keywordsnya dulu dong bos! ☠️" 
            });
        }

        try {
            const results = await xnxxScraper.search(q);
            res.status(200).json({
                status: true,
                query: q,
                count: results.length,
                result: results
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
