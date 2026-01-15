const axios = require('axios')

async function hitCoda(body) {
    try {
        const response = await axios.post('https://order-sg.codashop.com/initPayment.action', body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        return response.data
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data
        }
        throw new Error('Failed to fetch data from Codashop')
    }
}

async function cekGenshin(id) {
    let sn
    let sv
    const idStr = id.toString()
    
    if (idStr.startsWith('18') || idStr[0] === '8') {
        sn = 'Asia'
        sv = 'os_asia'
    } else {
        switch (idStr[0]) {
            case '6':
                sn = 'America'
                sv = 'os_usa'
                break
            case '7':
                sn = 'Europe'
                sv = 'os_euro'
                break
            case '9':
                sn = 'SAR (Taiwan, Hong Kong, Macao)'
                sv = 'os_cht'
                break
            default:
                return { success: false, message: 'Not found' }
        }
    }
    
    const body = `voucherPricePoint.id=116054&voucherPricePoint.price=16500&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=GENSHIN_IMPACT&shopLang=id_ID`
    const data = await hitCoda(body)
    
    if (data && data.confirmationFields && data.confirmationFields.username) {
        return {
            success: true,
            game: 'Genshin Impact',
            id: id,
            server: sn,
            name: data.confirmationFields.username
        }
    } else {
        return { success: false, message: 'Not found' }
    }
}

module.exports = function(app) {
    app.get("/stalk/genshin", async (req, res) => {
        const { user_id } = req.query
        
        if (!user_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'user_id' wajib diisi."
            })
        }

        try {
            const result = await cekGenshin(user_id)
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result
                })
            } else {
                return res.status(404).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "User tidak ditemukan"
                })
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Genshin Impact"
            })
        }
    })
}