// handlers.js

const tournamentJoin = require("../events/tournament/tournamentJoin");
const tournamentVerify = require("../events/tournament/tournamentVerify");
const handleNewMessage = require("../events/member/handleNewMessage");
const handleVerifyReaction = require("../events/member/handleVerifyReaction");
const scanOldMessages = require("../events/member/scanOldMessages");

module.exports = [
  // ==== Vùng xác minh thành viên ====
  {
    name: "Quét ảnh cũ chưa xác minh",
    icon: "📸",
    handler: {
      execute: scanOldMessages, // chuẩn hóa thành object chứa execute
    },
    runOnReady: true,
    onReady: scanOldMessages, // nếu cần scan lại khi bot khởi động
  },
  {
    name: "Lắng nghe ảnh mới gửi vào kênh xác minh",
    icon: "📥",
    handler: handleNewMessage, // đã export đúng định dạng { execute }
    event: "messageCreate",
  },
  {
    name: "Xử lý phản ứng xác minh / từ chối",
    icon: "✅",
    handler: handleVerifyReaction, // đã export đúng định dạng { execute }
    event: "messageReactionAdd",
  },

  // ==== Vùng đăng ký giải đấu ====
  {
  name: "Phản hồi đăng ký giải đấu",
  icon: "🏆",
  handler: {
    execute: tournamentJoin.execute,
  },
  event: "messageCreate",
  runOnReady: true,
  onReady: tournamentJoin.scanOldMessages,
  },
  {
    name: "Xử lý phản hồi đăng ký giải đấu",
    icon: "🎯",
    handler: tournamentVerify,
    event: "messageReactionAdd",
  },
];
