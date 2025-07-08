/**
 * 📂 quetTinNhanCu.js
 * Mục đích: Khi bot khởi động, quét lại các tin nhắn trong kênh xác minh.
 * Nếu có tin nhắn cũ chứa ảnh chưa được xác minh => thêm vào danh sách chờ.
 * Nếu không có ảnh => xóa luôn.
 */

const fs = require("fs");
const {
  VERIFY_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../config/constants");

module.exports = async (client) => {
  const pending = fs.existsSync(PENDING_DATA_FILE)
    ? JSON.parse(fs.readFileSync(PENDING_DATA_FILE))
    : {};

  const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
  const messages = await channel.messages.fetch({ limit: 50 });

  for (const msg of messages.values()) {
    if (msg.author.bot) continue;

    if (msg.attachments.size === 0) {
      await msg.delete().catch(() => {});
      console.log(`🗑️ Xoá tin nhắn không có ảnh từ ${msg.author.tag}`);
    } else if (!pending[msg.id]) {
      pending[msg.id] = msg.author.id;
      await msg.react(EMOJI_VERIFY);
      await msg.react(EMOJI_REJECT);
      console.log(`📦 Phát hiện ảnh cũ từ ${msg.author.tag}`);
    }
  }

  fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));
};
