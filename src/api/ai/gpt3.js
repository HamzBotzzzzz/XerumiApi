const axios = require("axios");

async function scrapeGpt3(messages) {
  try {
    const response = await axios.post(
      "https://chatbot-ji1z.onrender.com/chatbot-ji1z",
      { messages },
      {
        timeout: 30000,
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
          origin: "https://seoschmiede.at",
        },
      },
    );

    return JSON.parse(
      JSON.stringify(response.data.choices[0].message.content, null, 2),
    );
  } catch (error) {
    throw new Error("Failed to get response from API");
  }
}

module.exports = function(app) {
  app.get("/ai/gpt3", async (req, res) => {
    const { prompt, content } = req.query;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Parameter 'prompt' wajib diisi."
      });
    }

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Prompt harus berupa string yang tidak kosong."
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Prompt maksimal 2000 karakter."
      });
    }

    if (!content) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Parameter 'content' wajib diisi."
      });
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Content harus berupa string yang tidak kosong."
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Content maksimal 2000 karakter."
      });
    }

    try {
      const result = await scrapeGpt3([
        { role: "system", content: prompt.trim() },
        { role: "user", content: content.trim() },
      ]);

      if (!result) {
        return res.status(500).json({
          status: false,
          creator: "aerixxx",
          message: "Tidak ada hasil yang dikembalikan dari API."
        });
      }

      return res.json({
        status: true,
        creator: "aerixxx",
        result: result
      });
      
    } catch (error) {
      return res.status(500).json({
        status: false,
        creator: "aerixxx",
        message: "Gagal mendapatkan respons dari GPT-3"
      });
    }
  });

  app.post("/ai/gpt3", async (req, res) => {
    const messages = req.body || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Messages array diperlukan dan tidak boleh kosong."
      });
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "Setiap message object harus memiliki properti 'role' dan 'content'."
        });
      }
      
      if (!["system", "user", "assistant"].includes(message.role.toLowerCase())) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "Message role harus 'system', 'user', atau 'assistant'."
        });
      }
      
      if (typeof message.content !== "string" || message.content.trim().length === 0) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "Message content harus berupa string yang tidak kosong."
        });
      }
      
      if (message.content.length > 2000) {
        return res.status(400).json({
          status: false,
          creator: "aerixxx",
          message: "Message content maksimal 2000 karakter."
        });
      }
    }

    try {
      const result = await scrapeGpt3(messages);

      if (!result) {
        return res.status(500).json({
          status: false,
          creator: "aerixxx",
          message: "Tidak ada hasil yang dikembalikan dari API."
        });
      }

      return res.json({
        status: true,
        creator: "aerixxx",
        result: result
      });
      
    } catch (error) {
      return res.status(500).json({
        status: false,
        creator: "aerixxx",
        message: "Gagal mendapatkan respons dari GPT-3"
      });
    }
  });
};