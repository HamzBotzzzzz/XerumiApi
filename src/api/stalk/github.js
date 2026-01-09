const axios = require('axios');

async function githubstalk(user) {
    try {
        const { data } = await axios.get('https://api.github.com/users/' + user);
        
        const hasil = {
            username: data.login,
            nickname: data.name,
            bio: data.bio,
            id: data.id,
            nodeId: data.node_id,
            profile_pic: data.avatar_url,
            url: data.html_url,
            type: data.type,
            admin: data.site_admin,
            company: data.company,
            blog: data.blog,
            location: data.location,
            email: data.email,
            public_repo: data.public_repos,
            public_gists: data.public_gists,
            followers: data.followers,
            following: data.following,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
        
        return {
            success: true,
            result: hasil,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        return {
            success: false,
            message: error.response?.status === 404 ? 'User tidak ditemukan' : error.message
        };
    }
}

module.exports = function(app) {
    app.get("/stalk/github", async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'username' wajib diisi."
            });
        }

        try {
            const result = await githubstalk(username);
            
            if (result.success) {
                return res.json({
                    status: true,
                    creator: "aerixxx",
                    result: result.result
                });
            } else {
                return res.status(404).json({
                    status: false,
                    creator: "aerixxx",
                    message: result.message || "Gagal mengambil data GitHub"
                });
            }
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: "Gagal mengambil data GitHub"
            });
        }
    });
};