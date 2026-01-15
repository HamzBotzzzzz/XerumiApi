const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

require("./function.js");

const app = express();
const PORT = process.env.PORT || 8080;

const TELEGRAM_BOT_TOKEN = '8563405182:AAHotsKBoeMmId_KGmIC72IE1wNpjevMjmg';
const TELEGRAM_CHAT_ID = '5306444790';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

async function sendNotify(text) {
    try {
        await axios.post(TELEGRAM_API_URL, {
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            disable_web_page_preview: true
        });
    } catch (e) {}
}

global.sendNotify = sendNotify;

const settings = JSON.parse(fs.readFileSync('./assets/settings.json', 'utf-8'));
global.apikey = settings.apiSettings.apikey;

app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
    const start = Date.now();
    const originalJson = res.json;

    res.json = function (data) {
        const responseData = (data && typeof data === 'object') 
            ? { status: data.status, creator: "aerixxx", ...data } 
            : data;
        return originalJson.call(this, responseData);
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        const msg = `[${req.method}] ${res.statusCode} ${req.originalUrl} (${duration}ms)`;
        
        console.log(chalk.blue('LOG: ') + chalk.white(msg));
        
        if (res.statusCode >= 500) {
            sendNotify(`❌ ERROR SERVER\n${msg}\nIP: ${req.ip}`);
        }
        else if (req.path.includes('/api/reset-limit') || req.path.includes('/api/check-limit')) {
            sendNotify(`🔧 ADMIN ACTION\n${msg}\nIP: ${req.ip}`);
        }
    });
    next();
});

app.use(express.static(path.join(__dirname, 'api-page'), { index: 'index.html' }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/fitur', express.static(path.join(__dirname, 'fitur')));
app.use('/docs', express.static(path.join(__dirname, 'api-page'), { index: 'docs.html' }));

let totalRoutes = 0;
const apiBaseDir = path.join(__dirname, './src/api');

console.log(chalk.yellow('[INIT] Loading API routes...'));

if (fs.existsSync(apiBaseDir)) {
    const items = fs.readdirSync(apiBaseDir, { withFileTypes: true });
    const folders = items.filter(dirent => dirent.isDirectory()).map(d => d.name);
    
    folders.forEach(folder => {
        const folderPath = path.join(apiBaseDir, folder);
        const jsFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
        
        jsFiles.forEach(file => {
            try {
                const filePath = path.join(folderPath, file);
                const routeHandler = require(filePath);
                
                if (typeof routeHandler === 'function') {
                    routeHandler(app, () => "");
                    totalRoutes++;
                }
            } catch (error) {
                console.log(chalk.red(`✗ ${folder}/${file}: ${error.message}`));
            }
        });
    });
} else {
    console.log(chalk.red(`[ERROR] API directory not found!`));
}

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        uptime: process.uptime(),
        routes: totalRoutes,
        port: PORT 
    });
});

app.use((req, res) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    if (err.message && !err.message.includes('favicon')) {
        sendNotify(`⚠️ CRITICAL ERR\n${err.message}\nIP: ${req.ip}\nPath: ${req.path}`);
    }
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgGreen.black.bold(` Xerumi API active on port ${PORT} `));
    console.log(chalk.green(` Total routes loaded: ${totalRoutes}`));
});

module.exports = app;
