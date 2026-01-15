const axios = require('axios');

function shorten(url) {
  return new Promise(async (resolve, reject) => {
    let isurl = /https?:\/\//.test(url);
    if (!isurl) {
      return resolve({ creator: global.creator, status: false, message: "URL tidak valid" });
    }

    try {
      let response = await axios.get('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
      resolve({ 
        creator: global.creator, 
        status: true, 
        data: { 
          original: url,
          shortened: response.data 
        }
      });
    } catch (error) {
      resolve({ 
        creator: global.creator, 
        status: false, 
        message: "Gagal memendekkan URL" 
      });
    }
  });
}

module.exports = function(app) {
    app.get("/tools/shorten", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi."
            });
        }

        try {
            const result = await shorten(url);
            
            if (result.status) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.data
                });
            } else {
                return res.json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal memendekkan URL"
            });
        }
    });
};