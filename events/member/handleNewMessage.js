/**
 * 📂 xuLyTinNhanMoi.js
 * Xử lý khi người dùng gửi tin nhắn mới trong kênh xác minh.
 * - Nếu tin nhắn chứa ảnh: thêm vào danh sách chờ + gắn emoji xác minh.
 * - Nếu không phải ảnh: xóa tin nhắn.
 */

const fs = require("fs");
const path = require("path");
const {
  VERIFY_CHANNEL_ID,
  EMOJI_VERIFY,
  EMOJI_REJECT,
  PENDING_DATA_FILE,
} = require("../../config/constants");

module.exports = async (message) => {
  // Bỏ qua nếu không phải kênh xác minh hoặc là bot
  if (message.channel.id !== VERIFY_CHANNEL_ID || message.author.bot) return;

  // Nếu không có ảnh -> xóa tin nhắn
  if (message.attachments.size === 0) {
    try {
      await message.delete();
      console.log(`🗑️ Đã xoá tin nhắn không có ảnh từ ${message.author.tag}`);
    } catch (err) {
      console.warn(`⚠️ Không thể xoá tin nhắn: ${err.message}`);
    }
    return;
  }

  // Đảm bảo file tồn tại và đọc dữ liệu cũ
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

  // Lưu người gửi ảnh vào danh sách chờ
  pending[message.id] = message.author.id;

  try {
    fs.writeFileSync(PENDING_DATA_FILE, JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error(`❌ Không thể ghi file ${PENDING_DATA_FILE}: ${err.message}`);
    return;
  }

  // Gắn emoji phản hồi
  try {
    await message.react(EMOJI_VERIFY);
    await message.react(EMOJI_REJECT);
    console.log(`📸 Nhận ảnh từ ${message.author.tag}, đã gắn emoji phản hồi.`);
  } catch (err) {
    console.error(`❌ Không thể gắn emoji vào tin nhắn: ${err.message}`);
  }
};
