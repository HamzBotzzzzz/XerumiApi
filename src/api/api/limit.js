const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule'); // Tambahkan ini

module.exports = function (app) {
    // Helper untuk mendapatkan path file (biar tidak ngetik ulang)
    const userLimitPath = path.join(__dirname, '..', '..', 'data', 'user_limits.json');
    const validDeveloperKey = "aerixxxdev2025";

    // ===================== FUNGSI RESET OTOMATIS JAM 00:00 =====================
    function setupAutoReset() {
        console.log('⏰ Setting up daily auto-reset at 00:00...');
        
        // Jadwalkan reset setiap hari jam 00:00
        schedule.scheduleJob('0 0 * * *', () => {
            console.log('🔄 Running daily auto-reset at midnight...');
            
            try {
                // Pastikan folder ada
                const dir = path.dirname(userLimitPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                let userLimits = {};
                if (fs.existsSync(userLimitPath)) {
                    userLimits = JSON.parse(fs.readFileSync(userLimitPath, 'utf8'));
                }

                const today = new Date().toISOString().split('T')[0];
                let resetCount = 0;

                Object.keys(userLimits).forEach(user => {
                    // Reset daily limit ke 0
                    userLimits[user].daily_limit = 0;
                    userLimits[user].last_reset = today;
                    userLimits[user].auto_reset = true;
                    userLimits[user].reset_timestamp = new Date().toISOString();
                    resetCount++;
                });

                // Simpan perubahan
                fs.writeFileSync(userLimitPath, JSON.stringify(userLimits, null, 2), 'utf8');
                
                console.log(`✅ Auto-reset completed for ${resetCount} users at ${new Date().toISOString()}`);
                
            } catch (error) {
                console.error('❌ Error during auto-reset:', error);
            }
        });
        
        console.log('✅ Auto-reset scheduled: Daily at 00:00');
    }

    // Jalankan setup saat module dimuat
    setupAutoReset();

    // 1. Endpoint: Reset Semua Limit (Manual - untuk admin)
    app.get("/api/reset-limit", async (req, res) => {
        const { apikey } = req.query;

        if (!apikey || apikey !== validDeveloperKey) {
            return res.status(401).json({ status: false, message: "Apikey tidak valid." });
        }

        // Pastikan folder ada
        const dir = path.dirname(userLimitPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let userLimits = {};
        if (fs.existsSync(userLimitPath)) {
            userLimits = JSON.parse(fs.readFileSync(userLimitPath, 'utf8'));
        }

        const today = new Date().toISOString().split('T')[0];
        let resetCount = 0;

        Object.keys(userLimits).forEach(user => {
            userLimits[user].daily_limit = 0;
            userLimits[user].last_reset = today;
            userLimits[user].reset_by_developer = true;
            userLimits[user].reset_timestamp = new Date().toISOString();
            userLimits[user].reset_count = (userLimits[user].reset_count || 0) + 1;
            resetCount++;
        });

        fs.writeFileSync(userLimitPath, JSON.stringify(userLimits, null, 2), 'utf8');

        return res.json({
            status: true,
            creator: "aerixxx",
            message: `Berhasil mereset limit untuk ${resetCount} user.`,
            data: { 
                reset_count: resetCount, 
                last_reset: today,
                frontend_action: "reset_local_storage",
                instruction: "Frontend should clear localStorage 'daily_usage_' keys"
            }
        });
    });

    // 2. Endpoint: Cek Status Limit
    app.get("/api/check-limit", async (req, res) => {
        const { apikey } = req.query;

        if (!apikey || apikey !== validDeveloperKey) {
            return res.status(401).json({ status: false, message: "Apikey tidak valid." });
        }

        if (!fs.existsSync(userLimitPath)) {
            return res.json({ status: true, message: "Belum ada data.", data: { users: [] } });
        }

        const userLimits = JSON.parse(fs.readFileSync(userLimitPath, 'utf8'));
        const users = Object.keys(userLimits).map(user => ({
            user,
            ...userLimits[user]
        }));

        return res.json({ status: true, data: { total_users: users.length, users } });
    });

    // 3. Endpoint: Reset Spesifik User
    app.get("/api/admin/reset-client-limit", async (req, res) => {
        const { apikey, user_key } = req.query;

        if (!apikey || apikey !== validDeveloperKey) {
            return res.status(401).json({ status: false, message: "Developer key invalid." });
        }

        const today = new Date().toISOString().split('T')[0];
        const key = user_key || 'global_user';
        const storageKey = `rate_limit_${key}_${today}`;

        return res.json({
            status: true,
            message: `Instruksi reset untuk user: ${key}`,
            instruction: {
                action: "CLEAR_LOCAL_STORAGE",
                key_to_set: storageKey,
                value: { used: 0, date: today }
            },
            console_command: `localStorage.setItem("${storageKey}", '{"used":0,"date":"${today}"}'); location.reload();`
        });
    });

    // 4. Endpoint: Cek Status Reset Terakhir (Opsional)
    app.get("/api/reset-status", async (req, res) => {
        try {
            if (!fs.existsSync(userLimitPath)) {
                return res.json({ 
                    status: true, 
                    last_auto_reset: null,
                    next_reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
                });
            }

            const userLimits = JSON.parse(fs.readFileSync(userLimitPath, 'utf8'));
            let lastReset = null;
            
            // Cari reset terakhir dari semua user
            Object.keys(userLimits).forEach(user => {
                if (userLimits[user].reset_timestamp && 
                    (!lastReset || new Date(userLimits[user].reset_timestamp) > new Date(lastReset))) {
                    lastReset = userLimits[user].reset_timestamp;
                }
            });

            // Hitung waktu reset berikutnya (hari ini jam 00:00)
            const now = new Date();
            const nextReset = new Date(now);
            nextReset.setDate(nextReset.getDate() + 1);
            nextReset.setHours(0, 0, 0, 0);

            return res.json({
                status: true,
                last_auto_reset: lastReset,
                next_reset: nextReset.toISOString(),
                time_until_reset: nextReset.getTime() - now.getTime(),
                total_users: Object.keys(userLimits).length
            });
            
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    });
};