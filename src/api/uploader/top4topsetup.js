const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { top4top } = require('./top4top'); // adjust path as needed

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }
});

module.exports = function(app) {
  app.post("/upload/top4top", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "No file uploaded"
        });
      }

      const filePath = req.file.path;
      const result = await top4top(filePath);
      
      fs.unlinkSync(filePath);
      
      if (!result.success) {
        return res.status(500).json({
          status: false,
          creator: "aerixxx",
          message: result.message || "Upload failed"
        });
      }

      return res.json({
        status: true,
        creator: "aerixxx",
        message: "File uploaded successfully to Top4Top",
        result: result.result
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