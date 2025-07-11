const {
  EMOJI_VERIFY_ID,
  EMOJI_REJECT_ID,
  TOURNAMENT_ROLE_ID,
} = require("../../config/constants");

const TARGET_CHANNEL_ID = "1343237461039644754"; // Kênh đăng ký giải đấu

module.exports = {
  name: "messageReactionAdd",

  /**
   * Khi admin react xác minh / từ chối
   */
  async execute(reaction, user) {
    try {
      // Load đầy đủ dữ liệu nếu là partial
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();

      const message = reaction.message;

      // Bỏ qua nếu không phải kênh đăng ký giải đấu hoặc là bot
      if (message.channel.id !== TARGET_CHANNEL_ID || user.bot) return;

      // Chỉ xử lý với emoji xác minh / từ chối
      if (![EMOJI_VERIFY_ID, EMOJI_REJECT_ID].includes(reaction.emoji.id))
        return;

      const guild = message.guild;
      const member = await guild.members.fetch(user.id); // người thực hiện phản ứng
      const targetUser = await guild.members.fetch(message.author.id); // người đăng ký

      // Kiểm tra quyền của người thực hiện
      if (
        !member.permissions.has("ManageRoles") &&
        !member.permissions.has("Administrator")
      ) {
        console.log(`⛔️ ${user.tag} không có quyền xác minh.`);
        return;
      }

      // ✅ Nếu xác minh
      if (reaction.emoji.id === EMOJI_VERIFY_ID) {
        await targetUser.roles.add(TOURNAMENT_ROLE_ID);
        await message.reply(`✅ ${targetUser} đã được xác minh là tuyển thủ.`);
        console.log(`✅ ${targetUser.user.tag} đã được cấp role tuyển thủ.`);
      }

      // ❌ Nếu từ chối
      if (reaction.emoji.id === EMOJI_REJECT_ID) {
        await message.delete().catch(() => null);
        await targetUser
          .send(
            `❌ Đăng ký giải đấu của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.`,
          )
          .catch(() =>
            console.log(`⚠️ Không thể gửi DM cho ${targetUser.user.tag}`),
          );
        console.log(`❌ ${targetUser.user.tag} bị từ chối đăng ký.`);
      }
    } catch (err) {
      console.error(`🔥 Lỗi trong xử lý xác minh giải đấu:`, err);
    }
  },
};
