const axios = require('axios');
const path = require('path');
const { URL, URLSearchParams } = require('url');

class GeminiAPI {
    constructor(config) {
        if (!config.cookie) throw new Error("Cookie required");
        this.config = {
            cookie: "__Secure-1PSID=" + config.cookie,
            systemPrompt: config.systemPrompt || "",
            debug: config.debug || false,
        };
        this.initialUrl = "https://gemini.google.com";
        this.streamUrl = "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
        this.uploadUrl = "https://push.clients6.google.com/upload/";
        this.headers = {
            accept: "*/*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-model": "\"itel S665L\"",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-ch-ua-platform-version": "\"12.0.0\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-client-data": "COXZygE=",
            "x-goog-ext-525001261-jspb": "[1]",
            "x-same-domain": "1",
            cookie: this.config.cookie,
            Referer: "https://gemini.google.com/",
            "Referrer-Policy": "origin",
        };
        this.wizData = null;
    }

    log(message) {
        if (this.config.debug) console.log(`\x1b[36m[GeminiAPI]\x1b[0m \x1b[35m${message}\x1b[0m`);
    }

    isUrl(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    async downloadFile(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        const urlObj = new URL(url);
        let fileName = path.basename(urlObj.pathname);
        if (!fileName || !path.extname(fileName)) {
            const contentType = response.headers['content-type'];
            fileName = `file_${Date.now()}${this.getExtFromMime(contentType)}`;
        }
        return { buffer: Buffer.from(response.data), fileName };
    }

    getExtFromMime(mimeType) {
        const mimeMap = {
            'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
            'image/webp': '.webp', 'video/mp4': '.mp4', 'audio/mpeg': '.mp3',
            'application/pdf': '.pdf'
        };
        return mimeMap[mimeType] || '.bin';
    }

    detectFileSignature(buffer) {
        const signatures = [
            { bytes: [0xFF, 0xD8, 0xFF], mime: 'image/jpeg', type: 'image', ext: '.jpg' },
            { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mime: 'image/png', type: 'image', ext: '.png' },
            { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mime: 'image/gif', type: 'image', ext: '.gif' },
            { bytes: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp', type: 'image', ext: '.webp' },
            { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', type: 'document', ext: '.pdf' },
            { bytes: [0x50, 0x4B, 0x03, 0x04], mime: 'application/zip', type: 'archive', ext: '.zip' }
        ];
        for (const sig of signatures) {
            const offset = sig.offset || 0;
            if (buffer.length >= offset + sig.bytes.length) {
                if (sig.bytes.every((byte, index) => buffer[offset + index] === byte)) {
                    return { mimeType: sig.mime, fileType: sig.type, ext: sig.ext };
                }
            }
        }
        return null;
    }

    detectFileTypeAndMime(fileName, buffer) {
        const ext = path.extname(fileName).toLowerCase();
        if (buffer) {
            const signature = this.detectFileSignature(buffer);
            if (signature) return { mimeType: signature.mimeType, fileType: signature.fileType };
        }
        let mimeType = "application/octet-stream";
        let fileType = "unknown";
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            fileType = "image";
            mimeType = ext === '.png' ? "image/png" : "image/jpeg";
        } else if (['.mp4', '.webm'].includes(ext)) {
            fileType = "video";
            mimeType = ext === '.webm' ? "video/webm" : "video/mp4";
        } else if (['.pdf', '.txt'].includes(ext)) {
            fileType = "document";
            mimeType = ext === '.pdf' ? "application/pdf" : "text/plain";
        }
        return { mimeType, fileType };
    }

    async fetchWizData() {
        try {
            const response = await axios.get(this.initialUrl, { headers: this.headers });
            const wizRegex = /window\.WIZ_global_data\s*=\s*({[\s\S]*?});/;
            const match = response.data.match(wizRegex);
            this.wizData = match ? JSON.parse(match[1]) : null;
        } catch (error) {
            this.wizData = null;
        }
        return this.wizData;
    }

    async uploadImage(fileName, fileBuffer) {
        if (!this.wizData) await this.fetchWizData();
        const fileSize = fileBuffer.byteLength;
        const uploadHeaders = {
            ...this.headers,
            authority: "push.clients6.google.com",
            "push-id": this.wizData.qKIAYe,
            "x-client-pctx": this.wizData.Ylro7b,
            "x-goog-upload-command": "start",
            "x-goog-upload-header-content-length": fileSize.toString(),
            "x-goog-upload-protocol": "resumable",
            "x-tenant-id": "bard-storage",
        };
        try {
            const startResponse = await axios.post(this.uploadUrl, `File name: ${fileName}`, { headers: uploadHeaders });
            const uploadUrl = startResponse.headers["x-goog-upload-url"];
            const uploadFileHeaders = { ...uploadHeaders, "x-goog-upload-command": "upload, finalize", "x-goog-upload-offset": "0" };
            const uploadResponse = await axios.post(uploadUrl, fileBuffer, { headers: uploadFileHeaders });
            return uploadResponse.data || uploadUrl.split("/").pop();
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    async fetchImageUrl(rawImageUrl) {
        try {
            const first = await axios.get(rawImageUrl, { headers: this.headers, maxRedirects: 0, validateStatus: s => s === 302 });
            const second = await axios.get(first.headers.location, { headers: this.headers, maxRedirects: 0, validateStatus: s => s === 302 });
            return second.headers.location;
        } catch (error) {
            return null;
        }
    }

    async query(query, options = {}) {
        if (!this.wizData) await this.fetchWizData();
        const { file, conversationID, responseID, choiceID } = options;
        const params = { bl: this.wizData.cfb2h, "f.sid": this.wizData.FdrFJe, hl: "id", rt: "c" };
        const messageStruct = [
            [query, 0, null, null, null, null, 0], ["id"],
            [conversationID || "", responseID || "", choiceID || "", null, null, null, null, null, null, ""],
            null, null, null, [1], 1, null, null, 1, 0, null, null, null, null, null, [[0]], 1, null, null, null, null, null,
            ["", "", this.config.systemPrompt || "", null, null, null, null, null, 0, null, 1, null, null, null, []],
            null, null, 1, null, null, null, null, null, null, null, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], 1, null, null, null, null, [1]
        ];

        if (file) {
            let buf, name;
            if (Buffer.isBuffer(file)) {
                buf = file;
                const sig = this.detectFileSignature(buf);
                name = `file_${Date.now()}${sig ? sig.ext : '.bin'}`;
            } else if (this.isUrl(file)) {
                const dl = await this.downloadFile(file);
                buf = dl.buffer; name = dl.fileName;
            }
            const { mimeType } = this.detectFileTypeAndMime(name, buf);
            const loc = await this.uploadImage(name, buf);
            messageStruct[0][3] = [[[loc, 0, null, mimeType], name, null, null, null, null, null, null, [0]]];
        }

        const data = { "f.req": JSON.stringify([null, JSON.stringify(messageStruct)]), at: this.wizData.SNlM0e };
        const response = await axios.post(this.streamUrl, new URLSearchParams(data).toString(), { headers: this.headers, params });
        
        const lines = response.data.split("\n");
        let messageText = "", newCID = null, newRID = null, newChID = null, rawImg = null;

        for (const line of lines) {
            if (!line.startsWith("[[\"wrb.fr\"")) continue;
            try {
                const parsedLine = JSON.parse(line.match(/\[\["wrb\.fr".*\]\]/)[0]);
                const parsedChat = JSON.parse(parsedLine[0][2]);
                if (parsedChat[4]?.[0]?.[1]?.[0]) messageText = parsedChat[4][0][1][0];
                if (parsedChat[1]?.length >= 2) { newCID = parsedChat[1][0]; newRID = parsedChat[1][1]; }
                if (parsedChat[4]?.[0]?.[0]) newChID = parsedChat[4][0][0];
                if (parsedChat[4]?.[0]?.[12]?.[7]?.[0]?.[0]?.[0]?.[3]?.[3]) rawImg = parsedChat[4][0][12][7][0][0][0][3][3];
            } catch (e) {}
        }

        const result = { aiResponse: messageText.trim(), conversationID: newCID, responseID: newRID, choiceID: newChID };
        if (rawImg) result.addition = { generateImage: await this.fetchImageUrl(rawImg) };
        return result;
    }
}

module.exports = function (app, guf) {
    app.get("/ai/gemini", async (req, res) => {
        const { text, cookie, promptSystem, imageUrl } = req.query;
        if (!text || !cookie) return res.status(400).json({ status: false, error: "Text and Cookie required" });

        try {
            const gemini = new GeminiAPI({ cookie, systemPrompt: promptSystem });
            let file = imageUrl ? (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data : null;
            const result = await gemini.query(text, { file: file ? Buffer.from(file) : null });
            res.json({ status: true, creator: "aerixxx", data: result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });

    app.post("/ai/gemini", async (req, res) => {
        const { content, cookie, promptSystem } = req.body;
        if (!content || !cookie) return res.status(400).json({ status: false, error: "Content and Cookie required" });

        try {
            let fileBuffer = null;
            if (guf) {
                const uploaded = await guf(req, "file");
                if (uploaded && uploaded.file) fileBuffer = uploaded.file;
            }
            const gemini = new GeminiAPI({ cookie, systemPrompt: promptSystem });
            const result = await gemini.query(content, { file: fileBuffer });
            res.json({ status: true, creator: "aerixxx", data: result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
