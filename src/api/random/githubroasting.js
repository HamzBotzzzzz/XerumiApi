const axios = require("axios");

async function githubRoasting(reponame) {
    if (!reponame) {
        throw new Error("Masukkan Nama Repository Github.");
    }

    try {
        const { data: s } = await axios.post(
            `https://github-roaster.programordie.workers.dev/${reponame}`
        );

        return s.roast;
    } catch (errors) {
        throw new Error(errors.message);
    }
}

module.exports = function(app) {
    app.get("/random/githubroasting", async (req, res) => {
        const { repo } = req.query;
        
        if (!repo) {
            return res.status(400).json({
                status: false,
                creator: "aerixxx",
                message: "Parameter 'repo' wajib diisi. Contoh: facebook/react"
            });
        }

        try {
            const result = await githubRoasting(repo);
            
            return res.json({
                status: true,
                creator: "aerixxx",
                result: result
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                creator: "aerixxx",
                message: error.message || "Gagal melakukan roasting repository"
            });
        }
    });
};