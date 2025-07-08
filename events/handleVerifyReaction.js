/**
 * 📂 xuLyPhanUng.js
 * Mục đích: Khi admin phản ứng ✅/❌ vào ảnh
 * - Nếu là xác minh: thêm role xác minh, gỡ role chưa xác minh
 * - Nếu là từ chối: ghi log
 * - Gỡ khỏi danh sách chờ
 */

const fs = require("fs");
const {
  VERIFIED_ROLE_ID,
  UNVERIFIED_ROLE_ID,
  LOG_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../config/constants");

module.exports = async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (user.bot) return;

  const pending = fs.existsSync(PENDING_DATA_FILE)
    ? JSON.parse(fs.readFileSync(PENDING_DATA_FILE))
    : {};

  const messageId = reaction.message.id;
  const targetUserId = pending[messageId];
  if (!targetUserId) return;

  const guild = reaction.message.guild;
  const memberReacting = await guild.members.fetch(user.id);

  if (!memberReacting.permissions.has("Administrator")) {
    console.log(`⛔ ${user.tag} không có quyền xác minh.`);
    return;
  }

  const targetMember = await guild.members.fetch(targetUserId);
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

  if (reaction.emoji.id === EMOJI_VERIFY.replace(/[<:>]/g, "")) {
    await targetMember.roles.add(VERIFIED_ROLE_ID);
    await targetMember.roles.remove(UNVERIFIED_ROLE_ID).catch(() => {});
    if (logChannel) {
      logChannel.send(
        `✅ **<@${targetUserId}> đã được xác minh bởi <@${user.id}>**`,
      );
    }
  } else if (reaction.emoji.id === EMOJI_REJECT.replace(/[<:>]/g, "")) {
    if (logChannel) {
      logChannel.send(
        `❌ **<@${targetUserId}> bị từ chối xác minh bởi <@${user.id}>**`,
      );
    }
  }

  delete pending[messageId];
  fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));
};
