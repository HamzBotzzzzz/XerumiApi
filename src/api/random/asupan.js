const path = require('path');
const fs = require('fs');
const axios = require('axios');

module.exports = function (app) {
    const ASUPAN_URLS = [
        "https://raw.githubusercontent.com/Yuri-Neko/database/refs/heads/main/asupan/asupan.json",
        "https://raw.githubusercontent.com/Yuri-Neko/scraper-data/refs/heads/master/asupan/asupan.json"
    ];
    
    const CACHE_TIME = 5 * 60 * 1000;
    
    let videoCache = null;
    let cacheTimestamp = 0;

    async function fetchVideoList() {
        const now = Date.now();
        
        if (videoCache && (now - cacheTimestamp) < CACHE_TIME) {
            return videoCache;
        }
        
        videoCache = [];
        const allVideos = [];
        
        for (const url of ASUPAN_URLS) {
            try {
                const response = await axios.get(url, { timeout: 10000 });
                
                if (Array.isArray(response.data)) {
                    const validVideos = response.data.filter(item => {
                        if (typeof item === 'string') {
                            return item.includes('.mp4') && item.startsWith('http');
                        }
                        return false;
                    });
                    
                    allVideos.push(...validVideos);
                    console.log(`Loaded ${validVideos.length} videos from ${url}`);
                }
            } catch (error) {
                console.error(`Error fetching from ${url}:`, error.message);
            }
        }
        
        if (allVideos.length === 0) {
            videoCache = [
                "https://b.top4top.io/m_1931yxodg0.mp4",
                "https://k.top4top.io/m_193161p380.mp4"
            ];
        } else {
            videoCache = [...new Set(allVideos)];
        }
        
        cacheTimestamp = now;
        console.log(`Total unique videos: ${videoCache.length}`);
        return videoCache;
    }

    app.get("/random/asupan", async (req, res) => {
        try {
            const videos = await fetchVideoList();
            
            if (videos.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "Tidak ada video tersedia"
                });
            }
            
            const randomIndex = Math.floor(Math.random() * videos.length);
            const randomVideo = videos[randomIndex];
            const source = randomVideo.includes('top4top.io') ? 'Database' : 'Scraper';
            
            try {
                const videoResponse = await axios({
                    method: 'GET',
                    url: randomVideo,
                    responseType: 'stream',
                    timeout: 15000
                });
                
                res.set({
                    'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
                    'Cache-Control': 'public, max-age=300',
                    'Access-Control-Allow-Origin': '*',
                    'X-Video-Index': randomIndex,
                    'X-Total-Videos': videos.length,
                    'X-Video-Source': source,
                    'X-Video-URL': randomVideo
                });
                
                videoResponse.data.pipe(res);
                
            } catch (streamError) {
                console.error('Error streaming video:', streamError.message);
                
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    message: `Video asupan acak dari ${source}`,
                    data: {
                        index: randomIndex,
                        video_url: randomVideo,
                        direct_url: randomVideo,
                        total_videos: videos.length,
                        source: source,
                        note: "Use direct URL to play video"
                    }
                });
            }
            
        } catch (error) {
            console.error('Error in /random/asupan:', error.message);
            
            return res.status(500).json({
                status: false,
                message: "Gagal mengambil video acak",
                error: error.message
            });
        }
    });

    
};