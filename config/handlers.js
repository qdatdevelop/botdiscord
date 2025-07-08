module.exports = [
  {
    name: "Quét ảnh cũ chưa xác minh",
    icon: "📸",
    handler: require("../events/scanOldMessages"),
    runOnReady: true,
  },
  {
    name: "Lắng nghe ảnh mới gửi vào kênh xác minh",
    icon: "📥",
    handler: require("../events/handleNewMessage"),
    event: "messageCreate",
  },
  {
    name: "Xử lý phản ứng xác minh / từ chối",
    icon: "✅",
    handler: require("../events/handleVerifyReaction"),
    event: "messageReactionAdd",
  },
  // {
  //   name: "Tự động gỡ role chưa xác minh nếu đã có role xác minh",
  //   icon: "🧹",
  //   handler: require("../events/cleanupOldRoles"),
  //   runOnReady: true,
  // },
];
