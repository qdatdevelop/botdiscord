/**
 * 📂 quetTatCaThanhVien.js
 * Mục đích: Sau khi bot online, quét toàn bộ member trong server
 * Nếu member đã được xác minh mà vẫn còn role chưa xác minh => gỡ
 */

const {
  VERIFIED_ROLE_ID,
  UNVERIFIED_ROLE_ID,
} = require("../../config/constants");

module.exports = async (client) => {
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      console.log(`🔍 Đang quét server: ${guild.name} (${guild.id})`);
      const members = await guild.members.fetch();

      let cleanedCount = 0;

      for (const member of members.values()) {
        if (
          member.roles.cache.has(VERIFIED_ROLE_ID) &&
          member.roles.cache.has(UNVERIFIED_ROLE_ID)
        ) {
          await member.roles.remove(UNVERIFIED_ROLE_ID).catch(() => {});
          console.log(`🧹 Gỡ role chưa xác minh khỏi ${member.user.tag}`);
          cleanedCount++;
        }
      }

      console.log(`✅ Hoàn tất quét ${guild.name}: Đã xử lý ${cleanedCount} thành viên`);

    } catch (error) {
      console.error(`❌ Lỗi khi quét server ${guildId}: ${error.message}`);
    }
  }
};
