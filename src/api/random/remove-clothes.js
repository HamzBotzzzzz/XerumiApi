const axios = require('axios');
const FormData = require('form-data');
const githubUploader = require('../../../lib/github-uploader');

async function uploadToPixNova(buffer) {
    const form = new FormData();
    form.append('file', buffer, { filename: `img_${Date.now()}.jpg`, contentType: 'image/jpeg' });
    const response = await axios.post('https://api.pixnova.ai/aitools/upload-img', form, {
        headers: {
            'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
            'fp': '33a3340b3d335f6725444018a200e781',
            'fp1': '02PO6fcUryGs9kSPO80B3DCm6RS5AX5coEMhfGKjFfzqg+4JoWlqfvkinr2Anzve',
            'x-guide': 'SXxNZuM696B4/65ZAP/EVRjcKIMZ0VCmudI5Hy2hccOxQOO4/OcfzvtzWasokt6uS2N8wedhK7CocbzyL7djf37PDX8GlfcX3bG3mNCmfeHSvPia9X9HAzxZGZZO4U/OFIh+gOAuq4EdmWYkeqTGB5lKPWuXMY/OThlHC4fI8Vk=',
            'X-code': '1764830837805',
            ...form.getHeaders()
        }
    });
    return response.data.data.path;
}

async function processWithPixNova(imagePath) {
    const headers = {
        'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
        'fp': '33a3340b3d335f6725444018a200e781',
        'fp1': 'rMW1WPrbyOhvL5UIMabiqS9XBtfB05Tw81w1pIhX82eXep2zQHw3iEaiboX7PSBg',
        'x-guide': 'UlWxrzLYux3FBL1tpeYtJNdVS9ZsWbYk4Xh84vHTr+Ot8sSgs8xmnBGB6AgizwA/w64xmMyCgPZ778l63Li4EDvErPL0I5fhnxpJzkn5VxpBekGe8te1ISIJbYXjWT/MJKXYdDvwRC1r+d1EG90cMt3t8xGfNdc9JCkMhl/2ddA=',
        'X-code': '1764830839124',
        'Content-Type': 'application/json'
    };
    
    const create = await axios.post('https://api.pixnova.ai/aitools/of/create', {
        fn_name: 'cloth-change',
        call_type: 3,
        input: { source_image: imagePath, prompt: 'completely nude, no clothes, naked', cloth_type: 'full_outfits', request_from: 2, type: 1 },
        request_from: 2,
        origin_from: '111977c0d5def647'
    }, { headers });
    
    const taskId = create.data.data.task_id;
    let attempts = 0;
    
    // Looping nunggu di background
    while (attempts < 50) { 
        await new Promise(r => setTimeout(r, 4000)); // Nunggu 4 detik tiap interval
        const check = await axios.post('https://api.pixnova.ai/aitools/of/check-status', {
            task_id: taskId, fn_name: 'cloth-change', call_type: 3, consume_type: 0, request_from: 2, origin_from: '111977c0d5def647'
        }, { headers: { ...headers, 'X-code': '1764830864903' } });
        
        if (check.data.data.status === 2) return check.data.data.result_image;
        if (check.data.data.status === 3) throw new Error('AI gagal memproses foto ini.');
        attempts++;
    }
    throw new Error('Proses terlalu lama (Timeout).');
}

module.exports = function (app) {
    app.get('/random/remove-clothes', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: "URL gambar wajib ada!" });

        try {
            // 1. Download gambar dari URL
            const imgResponse = await axios.get(url, { responseType: 'arraybuffer' });
            
            // 2. Upload ke Pixnova
            const path = await uploadToPixNova(Buffer.from(imgResponse.data));
            
            // 3. Proses AI (Ini bakal nunggu/await sampai selesai)
            const resPath = await processWithPixNova(path);
            
            // 4. Ambil hasil gambar dari server Pixnova
            const resImg = await axios.get(`https://oss-global.pixnova.ai/${resPath}`, { responseType: 'arraybuffer' });
            
            // 5. Upload hasil ke GitHub lu
            const github = await githubUploader.uploadBuffer(Buffer.from(resImg.data), `naked_${Date.now()}.webp`);

            // 6. Kasih respon ke Frontend
            return res.json({
                status: true,
                creator: "aerixxx",
                result: {
                    original_url: url,
                    result_url: github.cdnUrl || github.rawUrl,
                    github_path: github.githubUrl
                }
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: e.message || "Terjadi kesalahan saat memproses gambar."
            });
        }
    });
};
