const axios = require('axios');
const qs = require('qs');

const CONFIG = {
    URL_INIT: 'https://www.hotelmurah.com/pulsa/pln',
    URL_CHECK: 'https://www.hotelmurah.com/pulsa/pln/cari_id_android',
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://www.hotelmurah.com',
        'referer': 'https://www.hotelmurah.com/pulsa/pln',
        'x-requested-with': 'XMLHttpRequest'
    }
};

async function checkPLN(customerId, phoneNumber = '081234567890') {
    try {
        const initRes = await axios.get(CONFIG.URL_INIT, { 
            headers: CONFIG.HEADERS 
        });

        const rawCookies = initRes.headers['set-cookie'];
        if (!rawCookies) return { status: false, msg: 'Gagal mengambil cookie.' };
        
        const getCookieValue = (name) => {
            const found = rawCookies.find(c => c.startsWith(name));
            return found ? found.split(';')[0].split('=')[1] : null;
        };

        const csrfToken = getCookieValue('hotelmurah_csrf_cookie_name');
        const ciSession = getCookieValue('ci_session');
        
        if (!csrfToken || !ciSession) return { status: false, msg: 'Token CSRF tidak ditemukan.' };

        const postData = qs.stringify({
            'id': customerId,
            'jenis': '1',
            'kode': 'TU',
            'nomer_hp': phoneNumber,
            'hm_csrf_hash_name': csrfToken 
        });

        const checkRes = await axios.post(CONFIG.URL_CHECK, postData, {
            headers: {
                ...CONFIG.HEADERS,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': `hotelmurah_csrf_cookie_name=${csrfToken}; ci_session=${ciSession}`
            }
        });

        return checkRes.data;

    } catch (error) {
        return { status: false, msg: error.message };
    }
}

module.exports = function(app) {
    app.get("/tools/cekpln", async (req, res) => {
        const { id, phone } = req.query;
        
        if (!id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'id' (Customer ID) wajib diisi."
            });
        }

        try {
            const result = await checkPLN(id, phone || '081234567890');
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengecek tagihan PLN"
            });
        }
    });
};