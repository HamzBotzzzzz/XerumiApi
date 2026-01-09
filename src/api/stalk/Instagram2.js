const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProfile(username) {
    try {
        const url = `https://insta-stories-viewer.com/${username}/`;

        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(html);

        const cleanUsername = $(".profile__nickname")
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();

        const followers = parseInt(
            $(".profile__stats-followers").text().replace(/\D/g, "")
        );

        const following = parseInt(
            $(".profile__stats-follows").text().replace(/\D/g, "")
        );

        const posts = parseInt(
            $(".profile__stats-posts").text().replace(/\D/g, "")
        );

        const description = $(".profile__description").text().trim();

        const profilePicture =
            $(".profile__avatar-pic").attr("src") || null;

        const bioLinks =
            description.match(/(https?:\/\/[^\s]+)/gi) || [];

        const result = {
            username: cleanUsername,
            followers,
            following,
            posts,
            profile_picture: profilePicture,
            bio_links: bioLinks,
            description
        };

        return {
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = function(app) {
    app.get("/stalk/ig2", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await scrapeProfile(username);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mengambil data Instagram"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data Instagram"
            });
        }
    });
};