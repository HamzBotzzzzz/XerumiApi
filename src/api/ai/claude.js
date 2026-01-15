const axios = require("axios")

class Claude {
  constructor() {
    this.api = "https://wewordle.org/gptapi/v1/web/turbo"
  }

  chat(prompt) {
    return axios
      .post(
        this.api,
        {
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://claude.online",
            "Referer": "https://claude.online/"
          }
        }
      )
      .then(res => res.data)
  }
}

const claude = new Claude()

module.exports = function (app) {
  app.get("/ai/claude", async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'text' wajib diisi."
      });
    }

    try {
      const data = await claude.chat(text);
      res.json({
        status: true,
        creator: "aerixxx",
        result: data
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Claude AI.",
        error: err.response?.data || err.message
      });
    }
  });
}