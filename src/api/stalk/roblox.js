const axios = require("axios");

class RobloxAPI {
  constructor() {
    this.baseUrl = "https://api.roblox.com";
  }

  async request(url, method = "GET", data = null, timeout = 10000) {
    try {
      const config = { method, url, timeout };
      if (data) config.data = data;
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getUserIdFromUsername(username) {
    const data = await this.request(
      "https://users.roblox.com/v1/usernames/users",
      "POST",
      {
        usernames: [username],
        excludeBannedUsers: false,
      }
    );
    return data?.data?.[0]?.id || null;
  }

  async getUserInfo(userId) {
    return await this.request(`https://users.roblox.com/v1/users/${userId}`);
  }

  async getUserStatus(userId) {
    return await this.request(`https://users.roblox.com/v1/users/${userId}/status`);
  }

  async getUserPresence(userIds) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    return await this.request(
      "https://presence.roblox.com/v1/presence/users",
      "POST",
      { userIds: ids }
    );
  }

  async getUserFriendsCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
  }

  async getUserFollowersCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
  }

  async getUserFollowingCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
  }

  async getUserGroups(userId) {
    return await this.request(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
  }

  async getUserPrimaryGroup(userId) {
    return await this.request(`https://groups.roblox.com/v1/users/${userId}/groups/primary/role`);
  }

  async getUserFavoriteGames(userId, limit = 5) {
    return await this.request(`https://games.roblox.com/v2/users/${userId}/favorite/games?limit=${limit}`);
  }

  async getUserRecentGames(userId, limit = 5) {
    return await this.request(`https://games.roblox.com/v2/users/${userId}/games?limit=${limit}`);
  }

  async getUserAvatarHeadshot(userId) {
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
  }

  async getUserAvatarFullBody(userId) {
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`);
  }

  async getUserAvatarBust(userId) {
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
  }

  async getUserAvatar(userId) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/avatar`);
  }

  async getUserCurrentlyWearing(userId) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`);
  }

  async getUserOutfits(userId) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=10`);
  }

  async getUserBadges(userId) {
    return await this.request(`https://badges.roblox.com/v1/users/${userId}/badges?limit=5`);
  }

  async getUserCollectibles(userId) {
    return await this.request(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=5`);
  }

  async getUserRobloxBadges(userId) {
    return await this.request(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`);
  }

  async getUserBundles(userId) {
    return await this.request(`https://catalog.roblox.com/v1/users/${userId}/bundles?limit=5`);
  }

  async getCompleteUserInfo(username) {
    const userId = await this.getUserIdFromUsername(username);
    if (!userId) return null;

    const [
      basic,
      status,
      presence,
      friends,
      followers,
      following,
      groups,
      primaryGroup,
      favoriteGames,
      recentGames,
      headshot,
      fullBody,
      bust,
      avatar,
      wearing,
      outfits,
      badges,
      collectibles,
      robloxBadges,
      bundles,
    ] = await Promise.all([
      this.getUserInfo(userId),
      this.getUserStatus(userId),
      this.getUserPresence([userId]),
      this.getUserFriendsCount(userId),
      this.getUserFollowersCount(userId),
      this.getUserFollowingCount(userId),
      this.getUserGroups(userId),
      this.getUserPrimaryGroup(userId),
      this.getUserFavoriteGames(userId, 5),
      this.getUserRecentGames(userId, 5),
      this.getUserAvatarHeadshot(userId),
      this.getUserAvatarFullBody(userId),
      this.getUserAvatarBust(userId),
      this.getUserAvatar(userId),
      this.getUserCurrentlyWearing(userId),
      this.getUserOutfits(userId),
      this.getUserBadges(userId),
      this.getUserCollectibles(userId),
      this.getUserRobloxBadges(userId),
      this.getUserBundles(userId),
    ]);

    return {
      userId,
      basic,
      status,
      presence,
      social: { friends, followers, following },
      groups: { list: groups, primary: primaryGroup },
      games: { favorites: favoriteGames, recent: recentGames },
      avatar: { headshot, fullBody, bust, details: avatar, wearing, outfits },
      achievements: { badges, collectibles, robloxBadges },
      catalog: { bundles },
    };
  }
}

const Roblox = new RobloxAPI();

async function stalkRoblox(username) {
  try {
    const result = await Roblox.getCompleteUserInfo(username);
    return {
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get Roblox user info"
    };
  }
}

module.exports = function(app) {
  app.get("/stalk/roblox", async (req, res) => {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "Parameter 'user' wajib diisi."
      });
    }

    if (typeof user !== "string" || user.trim().length === 0) {
      return res.status(400).json({
        status: false,
        creator: "aerixxx",
        message: "User harus berupa string yang tidak kosong."
      });
    }

    try {
      const result = await stalkRoblox(user.trim());
      
      if (result.success && result.result) {
        return res.json({
          status: true,
          creator: "aerixxx",
          result: result.result
        });
      } else {
        return res.status(404).json({
          status: false,
          creator: "aerixxx",
          message: result.message || "User tidak ditemukan"
        });
      }
      
    } catch (error) {
      return res.status(500).json({
        status: false,
        creator: "aerixxx",
        message: "Gagal mengambil data Roblox"
      });
    }
  });
};