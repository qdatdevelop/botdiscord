const fs = require("fs");
const {
  VERIFY_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../../config/constants");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.channel.id !== VERIFY_CHANNEL_ID || message.author.bot) return;

    if (message.attachments.size === 0) {
      try {
        await message.delete();
        console.log(`🗑️ Đã xoá tin nhắn không có ảnh từ ${message.author.tag}`);
      } catch (err) {
        console.warn(`⚠️ Không thể xoá tin nhắn: ${err.message}`);
      }
      return;
    }

    let pending = {};
    try {
      if (fs.existsSync(PENDING_DATA_FILE)) {
        const rawData = fs.readFileSync(PENDING_DATA_FILE, "utf8");
        pending = JSON.parse(rawData || "{}");
      }
    } catch (err) {
      console.error(`❌ Lỗi khi đọc file chờ xác minh: ${err.message}`);
      return;
    }

    pending[message.id] = message.author.id;

    try {
      fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));
    } catch (err) {
      console.error(
        `❌ Không thể ghi file ${PENDING_DATA_FILE}: ${err.message}`,
      );
      return;
    }

    try {
      await message.react(EMOJI_VERIFY);
      await message.react(EMOJI_REJECT);
      console.log(
        `📸 Nhận ảnh từ ${message.author.tag}, đã gắn emoji phản hồi.`,
      );
    } catch (err) {
      console.error(`❌ Không thể gắn emoji vào tin nhắn: ${err.message}`);
    }
  },
};
