const axios = require('axios')

async function hitCoda(body) {
    try {
        const response = await axios.post('https://order-sg.codashop.com/initPayment.action', body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return response.data
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data
        }
        throw new Error('Failed to fetch data from Codashop')
    }
}

async function cekBloodStrike(id) {
    const body = `voucherPricePoint.id=895135&voucherPricePoint.price=14000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=-1&voucherTypeName=BLOOD_STRIKE&shopLang=id_ID`
    const data = await hitCoda(body)
    
    if (data && data.confirmationFields && data.confirmationFields.username) {
        return {
            success: true,
            game: 'Blood Strike',
            id: id,
            name: data.confirmationFields.username
        }
    } else {
        return {
            success: false,
            message: 'Not found'
        }
    }
}

module.exports = function(app) {
    app.get("/stalk/bloodstrike", async (req, res) => {
        const { user_id } = req.query
        
        if (!user_id) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'user_id' wajib diisi."
            })
        }

        try {
            const result = await cekBloodStrike(user_id)
            
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
                message: "Gagal mengambil data Blood Strike"
            })
        }
    })
}