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

async function cekMCGG(id, zone) {
    const body = `voucherPricePoint.id=997117&voucherPricePoint.price=1579&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${zone}&voucherTypeName=106-MAGIC_CHESS&shopLang=id_ID`
    const data = await hitCoda(body)
    
    if (data && data.confirmationFields && data.confirmationFields.username) {
        return {
            success: true,
            game: 'Magic Chess: Go Go',
            id: id,
            zone: zone,
            name: data.confirmationFields.username
        }
    } else {
        return { success: false, message: 'Not found' }
    }
}

module.exports = function(app) {
    app.get("/stalk/magicchess", async (req, res) => {
        const { user_id, zone_id } = req.query
        
        if (!user_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'user_id' wajib diisi."
            })
        }

        if (!zone_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'zone_id' wajib diisi."
            })
        }

        try {
            const result = await cekMCGG(user_id, zone_id)
            
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
                message: "Gagal mengambil data Magic Chess: Go Go"
            })
        }
    })
}