const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

async function uploadCatbox(filePath) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
  });

  if (!res.data.startsWith("https://"))
    throw new Error("Upload failed");

  return res.data;
}

module.exports = function(app) {
  app.post("/upload/catbox", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "No file uploaded"
        });
      }

      const filePath = req.file.path;
      const catboxUrl = await uploadCatbox(filePath);
      
      fs.unlinkSync(filePath);
      
      return res.json({
        status: true,
        creator: "aerixxx",
        message: "File uploaded successfully",
        result: {
          url: catboxUrl,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
      
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        status: false,
        creator: "aerixxx",
        message: error.message
      });
    }
  });
};