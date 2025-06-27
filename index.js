require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// === ID CẤU HÌNH ===
const VERIFY_CHANNEL_ID = "1388212621710332099"; // Kênh nhận ảnh xác minh
const VERIFIED_ROLE_ID = "1388180240425156829";  // Role xác minh sẽ được cấp
const ALLOWED_STAFF_IDS = [
  "1388192256791416975", // ID admin
  "1388187078319407174", // ID mod
];

// === Biến tạm giữ ảnh chờ xác minh ===
let pending = {};

// === Khi bot hoạt động ===
client.on("ready", () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);

  // Khôi phục ảnh chờ xác minh từ file
  if (fs.existsSync("data.json")) {
    pending = JSON.parse(fs.readFileSync("data.json"));
    console.log(`📦 Đã khôi phục ${Object.keys(pending).length} ảnh chờ xác minh`);
  }
});

// === Khi có ảnh gửi vào kênh xác minh ===
client.on("messageCreate", async (message) => {
  if (message.channel.id !== VERIFY_CHANNEL_ID || message.author.bot) return;

  if (message.attachments.size > 0) {
    pending[message.id] = message.author.id;
    fs.writeFileSync("data.json", JSON.stringify(pending, null, 2));
    await message.react("✅");
    await message.react("❌");
    console.log(`📸 Nhận ảnh từ ${message.author.tag}`);
  }
});

// === Khi có người bấm nút xác minh ===
client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;

    const messageId = reaction.message.id;
    const targetUserId = pending[messageId];
    if (!targetUserId) return;

    // Kiểm tra người phản ứng có quyền xác minh không
    if (!ALLOWED_STAFF_IDS.includes(user.id)) {
      console.log(`⛔ ${user.tag} không có quyền xác minh.`);
      return;
    }

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(targetUserId);

    if (reaction.emoji.name === "✅") {
      await member.roles.add(VERIFIED_ROLE_ID);
      await reaction.message.reply(`<@${targetUserId}> đã được xác minh ✅`);
      console.log(`✅ Cấp role cho ${targetUserId}`);
    } else if (reaction.emoji.name === "❌") {
      await reaction.message.reply(`<@${targetUserId}> bị từ chối xác minh ❌`);
      console.log(`❌ Từ chối xác minh ${targetUserId}`);
    }

    delete pending[messageId];
    fs.writeFileSync("data.json", JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error("❗ Lỗi khi xử lý phản ứng:", err);
  }
});

// === Bắt đầu chạy bot ===
client.login(process.env.TOKEN);
