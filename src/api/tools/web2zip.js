const axios = require('axios')

async function saveweb2zip(url, options = {}) {
    try {
        if (!url) throw new Error('URL is required')
        url = url.startsWith('https://') || url.startsWith('http://') ? url : `https://${url}`
        
        const {
            renameAssets = false,
            saveStructure = false,
            alternativeAlgorithm = false,
            mobileVersion = false
        } = options
        
        const { data } = await axios.post('https://copier.saveweb2zip.com/api/copySite', {
            url,
            renameAssets,
            saveStructure,
            alternativeAlgorithm,
            mobileVersion
        }, {
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'origin': 'https://saveweb2zip.com',
                'referer': 'https://saveweb2zip.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        })
        
        if (!data.md5) {
            throw new Error('No MD5 hash returned from server')
        }
        
        const md5 = data.md5
        let process
        let attempts = 0
        const maxAttempts = 300
        
        while (attempts < maxAttempts) {
            attempts++
            
            try {
                const { data: statusData } = await axios.get(`https://copier.saveweb2zip.com/api/getStatus/${md5}`, {
                    headers: {
                        'accept': '*/*',
                        'content-type': 'application/json',
                        'origin': 'https://saveweb2zip.com',
                        'referer': 'https://saveweb2zip.com/',
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                    }
                })
                
                process = statusData
                
                if (process.isFinished) {
                    break
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000))
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    continue
                }
                throw error
            }
        }
        
        if (attempts >= maxAttempts) {
            throw new Error('Processing timeout after 5 minutes')
        }
        
        const result = {
            url,
            success: !process.errorText,
            error: {
                text: process.errorText || null,
                code: process.errorCode || null,
            },
            copiedFilesAmount: process.copiedFilesAmount || 0,
            downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${md5}`
        }
        
        return result
        
    } catch (error) {
        throw new Error(`SaveWeb2Zip failed: ${error.message}`)
    }
}

module.exports = function(app) {
    app.get("/tools/web2zip", async (req, res) => {
        const { url, renameAssets, saveStructure, alternativeAlgorithm, mobileVersion } = req.query
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            })
        }

        try {
            const options = {
                renameAssets: renameAssets === 'true',
                saveStructure: saveStructure === 'true',
                alternativeAlgorithm: alternativeAlgorithm === 'true',
                mobileVersion: mobileVersion === 'true'
            }
            
            const result = await saveweb2zip(url, options)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result
                })
            } else {
                return res.json({
                    status: false,
                    creator: "aerixxx",
                    message: result.error.text || "Gagal mengarsip website"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengarsip website"
            })
        }
    })
}