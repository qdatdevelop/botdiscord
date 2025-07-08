/**
 * 📂 quetTatCaThanhVien.js
 * Mục đích: Sau khi bot online, quét toàn bộ member trong server
 * Nếu member đã được xác minh mà vẫn còn role chưa xác minh => gỡ
 */

const { VERIFIED_ROLE_ID, UNVERIFIED_ROLE_ID } = require("../config/constants");

module.exports = async (client) => {
  for (const [guildId, guild] of client.guilds.cache) {
    const members = await guild.members.fetch();
    for (const member of members.values()) {
      if (
        member.roles.cache.has(VERIFIED_ROLE_ID) &&
        member.roles.cache.has(UNVERIFIED_ROLE_ID)
      ) {
        await member.roles.remove(UNVERIFIED_ROLE_ID).catch(() => {});
        console.log(`🧹 Đã xoá role chưa xác minh của ${member.user.tag}`);
      }
    }
  }
};
