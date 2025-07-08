/**
 * 📂 xuLyTinNhanMoi.js
 * Mục đích: Khi người dùng gửi tin nhắn mới trong kênh xác minh.
 * - Nếu là ảnh: thêm vào danh sách chờ + gắn emoji xác minh.
 * - Nếu không phải ảnh: xóa tin nhắn.
 */

const fs = require("fs");
const {
  VERIFY_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../config/constants");

module.exports = async (message) => {
  if (message.channel.id !== VERIFY_CHANNEL_ID || message.author.bot) return;

  if (message.attachments.size === 0) {
    await message.delete().catch(() => {});
    console.log(`🗑️ Xoá tin nhắn không có ảnh từ ${message.author.tag}`);
    return;
  }

  const pending = fs.existsSync(PENDING_DATA_FILE)
    ? JSON.parse(fs.readFileSync(PENDING_DATA_FILE))
    : {};

  pending[message.id] = message.author.id;
  fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));

  await message.react(EMOJI_VERIFY);
  await message.react(EMOJI_REJECT);
  console.log(`📸 Nhận ảnh từ ${message.author.tag}`);
};
