const axios = require('axios')
const crypto = require('crypto')

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

async function cekFF(id) {
    const body = `voucherPricePoint.id=8063&voucherPricePoint.price=10000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=FREEFIRE&shopLang=id_ID`
    const data = await hitCoda(body)
    
    if (data && data.confirmationFields && data.confirmationFields.roles && data.confirmationFields.roles[0]) {
        return {
            success: true,
            game: 'Garena Free Fire',
            id: id,
            name: data.confirmationFields.roles[0].role
        }
    } else {
        return { success: false, message: 'Not found' }
    }
}

async function cekFreeFire(id) {
    const merchantId = 'YOUR-MERCHANT-ID'
    const secretKey = 'YOUR-SECRET-KEY'
    const signature = crypto.createHash('md5').update(merchantId + secretKey).digest('hex')
    const url = `https://v1.apigames.id/merchant/${merchantId}/cek-username/freefire?user_id=${id}&signature=${signature}`
    
    try {
        const response = await axios.get(url)
        if (response.data.status === 1 && response.data.data.is_valid) {
            return {
                success: true,
                game: 'Free Fire',
                id: id,
                name: response.data.data.username
            }
        } else {
            return await cekFF(id)
        }
    } catch (error) {
        return await cekFF(id)
    }
}

module.exports = function(app) {
    app.get("/stalk/ff", async (req, res) => {
        const { user_id } = req.query
        
        if (!user_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'user_id' wajib diisi."
            })
        }

        try {
            const result = await cekFreeFire(user_id)
            
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
                message: "Gagal mengambil data Free Fire"
            })
        }
    })
}