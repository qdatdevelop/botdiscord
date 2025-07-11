/**
 * 📂 xuLyPhanUng.js
 * Xử lý khi admin phản ứng ✅/❌ vào ảnh trong kênh xác minh.
 */

const fs = require("fs");
const {
  VERIFIED_ROLE_ID,
  UNVERIFIED_ROLE_ID,
  LOG_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../../config/constants");

module.exports = async (reaction, user) => {
  try {
    // Đảm bảo dữ liệu đã đầy đủ
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;

    // Đọc danh sách chờ xác minh
    const messageId = reaction.message.id;
    const pending = fs.existsSync(PENDING_DATA_FILE)
      ? JSON.parse(fs.readFileSync(PENDING_DATA_FILE, "utf8"))
      : {};
    const targetUserId = pending[messageId];
    if (!targetUserId) return;

    const guild = reaction.message.guild;
    const memberReacting = await guild.members.fetch(user.id);

    // Kiểm tra quyền quản trị
    if (!memberReacting.permissions.has("Administrator")) {
      console.log(`⛔ ${user.tag} không có quyền xác minh.`);
      return;
    }

    const targetMember = await guild.members.fetch(targetUserId);
    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

    const emojiId = reaction.emoji.id || reaction.emoji.name;
    const EMOJI_VERIFY_ID = EMOJI_VERIFY.replace(/[<:>]/g, "");
    const EMOJI_REJECT_ID = EMOJI_REJECT.replace(/[<:>]/g, "");

    if (emojiId === EMOJI_VERIFY_ID) {
      await targetMember.roles.add(VERIFIED_ROLE_ID);
      await targetMember.roles.remove(UNVERIFIED_ROLE_ID).catch(() => {});

      logChannel?.send(
        `✅ **<@${targetUserId}> đã được xác minh bởi <@${user.id}>.**`
      );
      console.log(`✅ ${targetMember.user.tag} đã được xác minh.`);
    } else if (emojiId === EMOJI_REJECT_ID) {
      logChannel?.send(
        `❌ **<@${targetUserId}> bị từ chối xác minh bởi <@${user.id}>.**`
      );
      console.log(`❌ ${targetMember.user.tag} bị từ chối xác minh.`);
    }

    // Xóa khỏi danh sách chờ
    delete pending[messageId];
    fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error(`❌ Lỗi xử lý phản ứng xác minh: ${err.message}`);
  }
};
