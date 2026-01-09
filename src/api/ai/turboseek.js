const axios = require('axios');

async function turboseek(question) {
    try {
        if (!question) throw new Error('Question is required.');
        
        const inst = axios.create({
            baseURL: 'https://www.turboseek.io/api',
            headers: {
                origin: 'https://www.turboseek.io',
                referer: 'https://www.turboseek.io/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        const { data: sources } = await inst.post('/getSources', {
            question: question
        });
        
        const { data: similarQuestions } = await inst.post('/getSimilarQuestions', {
            question: question,
            sources: sources
        });
        
        const { data: answer } = await inst.post('/getAnswer', {
            question: question,
            sources: sources
        });
        
        const cleanAnswer = answer.match(/<p>(.*?)<\/p>/gs)?.map(match => {
            return match.replace(/<\/?p>/g, '').replace(/<\/?strong>/g, '').replace(/<\/?em>/g, '').replace(/<\/?b>/g, '').replace(/<\/?i>/g, '').replace(/<\/?u>/g, '').replace(/<\/?[^>]+(>|$)/g, '').trim();
        }).join('\n\n') || answer.replace(/<\/?[^>]+(>|$)/g, '').trim();
        
        return {
            answer: cleanAnswer,
            sources: sources.map(s => s.url),
            similarQuestions
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = function(app) {
    app.get("/ai/turboseek", async (req, res) => {
        const { text } = req.query;
        
        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'text' wajib diisi."
            });
        }

        try {
            const result = await turboseek(text);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result.answer
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mendapatkan respons dari TurboSeek AI"
            });
        }
    });
};