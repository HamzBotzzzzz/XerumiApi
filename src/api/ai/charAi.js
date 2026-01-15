const axios = require('axios');

async function CharAi(query, chark) {
  return new Promise(async (resolve, reject) => {
    const params = new URLSearchParams();
    params.append('message', query);
    params.append('intro', chark);
    params.append('name', chark);

    axios({
      url: "https://boredhumans.com/api_celeb_chat.php",
      method: "POST",
      headers: {
        "cookie": "boredHuman=2023-09-20; website-builder=2; adoptme_ck=f10961a8; ai-tools=1; code_generation=3; article-writer=2; text-to-image=1; research-paper=1; haiku=1; template=2",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: params.toString()
    }).then((response) => {
      resolve(response.data.output);
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = function(app) {
    app.get("/ai/charAi", async (req, res) => {
        const { query, character } = req.query;
        
        if (!query || !character) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'query' dan 'character' wajib diisi. Contoh character: elon-musk, taylor-swift, etc."
            });
        }

        try {
            const result = await CharAi(query, character);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan respon dari Character AI"
            });
        }
    });
};