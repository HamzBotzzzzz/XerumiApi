const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class Viu {
    constructor() {
        this.inst = axios.create({
            baseURL: 'https://api-gateway-global.viu.com/api',
            headers: {
                'accept-encoding': 'gzip',
                'content-type': 'application/x-www-form-urlencoded',
                platform: 'android',
                'user-agent': 'okhttp/4.12.0'
            }
        });
        
        this.token = null;
    }
    
    getToken = async function () {
        try {
            const { data } = await this.inst.post('/auth/token', {
                countryCode: 'ID',
                platform: 'android',
                platformFlagLabel: 'phone',
                language: '8',
                deviceId: uuidv4(),
                dataTrackingDeviceId: uuidv4(),
                osVersion: '28',
                appVersion: '2.21.0',
                buildVersion: '770',
                carrierId: '72',
                carrierName: 'Telkomsel',
                appBundleId: 'com.vuclip.viu',
                vuclipUserId: '',
                deviceBrand: 'vivo',
                deviceModel: 'V2242A',
                flavour: 'all'
            });
            
            this.token = data.token;
            this.inst.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            return data.token;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    home = async function () {
        try {
            if (!this.token) await this.getToken();
            
            const { data } = await this.inst.get('/mobile', {
                params: {
                    r: '/home/index',
                    platform_flag_label: 'phone',
                    language_flag_id: '8',
                    ut: '0',
                    area_id: '1000',
                    os_flag_id: '2',
                    countryCode: 'ID'
                }
            });
            
            return data.data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = function(app) {
    const v = new Viu();
    
    app.get("/random/viuu", async (req, res) => {
        try {
            const result = await v.home();
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data dari Viu"
            });
        }
    });
};