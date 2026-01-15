const axios = require('axios');

async function bard(query, proxy) {
    const headers = {
        "accept": "*/*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "cookie": "SID=g.a000xgjZzrQfaZEtfrx6RTCW0Q2eNdm21jCoqu6_6gbIG_5BW1UqfX3rVgA9pY_NUmooLdFOtgACgYKAXMSARESFQHGX2MiStGZcVw3-iYoPwyj8zrLZxoVAUF8yKrAb4ZtewtJKgYqiP8F-xvf0076; __Secure-1PSID=g.a000xgjZzrQfaZEtfrx6RTCW0Q2eNdm21jCoqu6_6gbIG_5BW1UqEWHMHU14F9OS04MFWXsY7gACgYKAYQSARESFQHGX2MidwdmCRTP1XVih97lZJXIcBoVAUF8yKrcN4up_gHiXrkm5wXkr5eG0076; __Secure-3PSID=g.a000xgjZzrQfaZEtfrx6RTCW0Q2eNdm21jCoqu6_6gbIG_5BW1UqY8mGYteZRFfIWjoBiKGCIQACgYKAUoSARESFQHGX2MiRWwwFAvVah8tWyG4XCcJURoVAUF8yKrZcR32U-uyYhsGALqzmIMC0076; HSID=AvmQH0mdl2zBBDDhL; SSID=AL95Dq3nk9IaZOYq9; APISID=2U3-vhdc_snKMweT/AbWKabVcqy1wp0V8m; SAPISID=Io4ANmKtsIQJ6av7/AiZQRUuMKrKtvpamz; __Secure-1PAPISID=Io4ANmKtsIQJ6av7/AiZQRUuMKrKtvpamz; __Secure-3PAPISID=Io4ANmKtsIQJ6av7/AiZQRUuMKrKtvpamz; SEARCH_SAMESITE=CgQIkZ4B; AEC=AVh_V2jx-ygytAWOkdx3Dp-eJgXq2XMY7j28_SPz6l7Ly3JV35AU2K5kbas; NID=524=fgD6K7XFmo5jIfmBF952UZA4owuGNI5ESUmyxZbMQ3tw7f2C20hvREmH1Y6iBUtON8ZzJrkUNdO8c6Fem3aWrBGFKSqN8bOSjS6ipNvxMDfAAqPfLvCw9JVOVSop9qQMA9OpcOM84PaYM6FkUDpwFudEaktUQcoPqOWrExFSp0r9T3XAwM6wYO1o4l58dV7cg0Ie3I2wASVe2RemkdEk7O0TLUh4wTvk9_lfAZbdeXro4QTXCWBqXGfJAVGadstl0QzfJK2eq9Y6g3E; _gcl_au=1.1.694955648.1750223942; _ga=GA1.1.770133012.1750223946; _ga_WC57KJ50ZZ=GS2.1.s1750223946$o1$g1$t1750224696$j48$l0$h0; SIDCC=AKEyXzUfWhB1Uz7zi8AWogT0h1bSsuHnUH-MBEXUGoTa7TTkVkTcahlnzznu9m4aNhNmxDw9Hw; __Secure-1PSIDCC=AKEyXzWj-dKAyEYtgjFqlCP_opyky_ObERiwqUaML3q6G5jXMZeXqn6tR2i5jrhiCh4j4Mp-eQ; __Secure-3PSIDCC=AKEyXzVS4X4jKeszJyynIPdsAoMgZdAyOvq6wERqNvbHs3blb1xGv0JEE-Y67GTH74_AcNM5BQ;",
        "Referer": "https://gemini.google.com/",
    };

    try {
        const initialResponse = await axios.get(proxy + "https://gemini.google.com", { headers });
        const html = initialResponse.data;
        const wizRegex = /window\.WIZ_global_data\s*=\s*({[\s\S]*?});/;
        const match = html.match(wizRegex);
        const wizData = match ? JSON.parse(match[1].replace(/'/g, '"')) : null;

        if (!wizData) throw new Error("Failed to get wizData");

        const params = {
            bl: "boq_assistant-bard-web-server_20250313.10_p5",
            "f.sid": wizData.FdrFJe,
            hl: "id",
            _reqid: Math.floor(Math.random() * 9000000 + 1000000).toString(),
            rt: "c",
        };

        const fReq = `[null,"[[\\"${query}\\"],null,[\\"\\",\\"\\",\\"\\\"]]\"]`;
        const postData = new URLSearchParams({
            "f.req": fReq,
            at: wizData.SNlM0e,
        }).toString();

        const streamResponse = await axios.post(
            proxy + `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${new URLSearchParams(params)}`,
            postData,
            { headers }
        );

        const responseData = streamResponse.data;
        let identifier = responseData.split('null,[[\\"')[1]?.split('\\"')[0] || responseData.split('null,[["')[1]?.split('"')[0];
        let lines = responseData.split("\n");
        let lastLine = "";

        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes(identifier)) {
                lastLine = lines[i];
                break;
            }
        }

        const chat = JSON.parse(lastLine)[0][2];
        const son = JSON.parse(chat)[4];
        const text = son[0][1][0];
        return text.replace(/\*\*/g, "*");

    } catch (error) {
        throw new Error(error.message || "Failed to get response from Bard");
    }
}

module.exports = function (app) {
    app.get("/ai/bard", async (req, res) => {
        const { query } = req.query;

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                error: "Query parameter is required"
            });
        }

        try {
            const currentProxy = "";
            const result = await bard(query.trim(), currentProxy);

            return res.json({
                status: true,
                creator: "aerixxx",
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                error: error.message
            });
        }
    });
};