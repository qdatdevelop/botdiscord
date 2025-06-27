
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// ==== KHỞI TẠO EXPRESS WEB SERVER ====
app.get("/", (req, res) => {
  res.send("✅ Bot đang hoạt động!");
});
app.listen(PORT, () => {
  console.log(`🌐 Web server đang chạy tại cổng ${PORT}`);
});

// ==== KHỞI TẠO DISCORD BOT ====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// ==== CẤU HÌNH ====
const VERIFY_CHANNEL_ID = "1388212621710332099"; // Kênh xác minh
const VERIFIED_ROLE_ID = "1388180240425156829";  // Role cần cấp
const ALLOWED_STAFF_IDS = [
  "1388192256791416975", // ID admin
  "1388187078319407174", // ID mod
];

// ==== BỘ NHỚ TẠM CHO ẢNH ====
let pending = {};

// ==== BOT ONLINE ====
client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);

  if (fs.existsSync("data.json")) {
    pending = JSON.parse(fs.readFileSync("data.json"));
    console.log(`📦 Đã khôi phục ${Object.keys(pending).length} ảnh chờ xác minh`);
  }
});

// ==== XỬ LÝ GỬI ẢNH ====
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

// ==== XỬ LÝ PHẢN ỨNG ====
client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;

    const messageId = reaction.message.id;
    const targetUserId = pending[messageId];
    if (!targetUserId) return;

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
    console.error("❗ Lỗi khi xử lý reaction:", err);
  }
});

// ==== KHỞI ĐỘNG BOT ====
client.login(process.env.TOKEN);
