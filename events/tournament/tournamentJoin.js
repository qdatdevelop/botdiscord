const {
  EMOJI_VERIFY,
  EMOJI_REJECT,
  EMOJI_VERIFY_ID,
  EMOJI_REJECT_ID,
} = require("../../config/constants");

const CHANNEL_ID = "1343237461039644754"; // ID kênh đăng ký giải đấu

module.exports = {
  name: "messageCreate",

  /**
   * Thêm reaction khi người dùng gửi tin nhắn mới
   */
  async execute(message) {
    try {
      if (message.channel.id !== CHANNEL_ID || message.author.bot) return;
      await addReactionsIfNeeded(message);
    } catch (err) {
      console.error(`❌ Lỗi khi xử lý message mới:`, err);
    }
  },

  /**
   * Quét và thêm reaction cho tin nhắn cũ chưa được react
   * Gọi từ index.js khi bot khởi động
   */
  async scanOldMessages(client) {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel || !channel.isTextBased()) {
        return console.error(`❌ Không tìm thấy kênh hoặc không phải kênh văn bản: ${CHANNEL_ID}`);
      }

      console.log(`🔁 Bắt đầu quét tin nhắn cũ trong kênh đăng ký giải đấu...`);

      const messages = await channel.messages.fetch({ limit: 100 });
      let count = 0;

      for (const message of messages.values()) {
        if (message.author.bot) continue;

        const hasVerify = message.reactions.cache.some(
          (r) => r.emoji.id === EMOJI_VERIFY_ID
        );
        const hasReject = message.reactions.cache.some(
          (r) => r.emoji.id === EMOJI_REJECT_ID
        );

        if (!hasVerify || !hasReject) {
          await addReactionsIfNeeded(message);
          count++;
        }
      }

      console.log(`✅ Đã cập nhật reaction cho ${count} tin nhắn cũ.`);
    } catch (err) {
      console.error(`🔥 Lỗi khi quét tin nhắn cũ:`, err);
    }
  },
};

/**
 * Thêm reaction nếu tin nhắn chưa có đầy đủ reaction
 */
async function addReactionsIfNeeded(message) {
  try {
    const existing = message.reactions.cache.map((r) => r.emoji.id);

    if (!existing.includes(EMOJI_VERIFY_ID)) {
      await message.react(EMOJI_VERIFY).catch((err) =>
        console.error(`❌ Lỗi khi thêm emoji xác minh vào message ${message.id}:`, err)
      );
    }

    if (!existing.includes(EMOJI_REJECT_ID)) {
      await message.react(EMOJI_REJECT).catch((err) =>
        console.error(`❌ Lỗi khi thêm emoji từ chối vào message ${message.id}:`, err)
      );
    }

    console.log(`➕ Đã cập nhật reaction cho message ${message.id} của ${message.author.tag}`);
  } catch (err) {
    console.error(`🔥 Lỗi khi thêm reaction:`, err);
  }
}
