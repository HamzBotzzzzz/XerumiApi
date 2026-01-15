const FormData = require('form-data');
const { Buffer } = require('buffer');
const https = require('https');

function remini(urlPath) {
  return new Promise(async (resolve, reject) => {
    let buffer;
    let Form = new FormData();
    let scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/enhance";
    
    Form.append("model_version", 1);
    Form.append("image", Buffer.from(urlPath), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    });
    
    const options = {
      hostname: "inferenceengine.vyro.ai",
      path: "/enhance",
      method: "POST",
      headers: Form.getHeaders(),
      protocol: "https:"
    };

    const req = https.request(options, (res) => {
      let data = [];
      res.on("data", function (chunk) {
        data.push(chunk);
      });
      res.on("end", () => {
        resolve(Buffer.concat(data));
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    Form.pipe(req);
  });
}

module.exports = function(app) {
    app.get("/tools/remini", async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'url' wajib diisi (base64 image string)."
            });
        }

        try {
            const result = await remini(url);
            
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(result);
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal melakukan enhacement gambar"
            });
        }
    });
};