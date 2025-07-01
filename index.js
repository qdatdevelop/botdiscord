require("dotenv").config();
const fs = require("fs");
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// ==== WEB SERVER KEEP-ALIVE ====
app.get("/", (req, res) => {
  res.send("✅ Bot đang hoạt động!");
});
app.listen(PORT, () => {
  console.log(`🌐 Web server đang chạy tại cổng ${PORT}`);
});

// ==== DISCORD BOT CONFIG ====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// ==== CÁC ID QUAN TRỌNG ====
const VERIFY_CHANNEL_ID = "1388212621710332099"; // Kênh xác minh
const VERIFIED_ROLE_ID = "1388180240425156829";  // Role xác minh
const LOG_CHANNEL_ID = "1388212907350691992";    // Kênh log kết quả

// ==== DỮ LIỆU TẠM ====
let pending = {};

// ==== BOT KHỞI ĐỘNG ====
client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);

  if (fs.existsSync("data.json")) {
    pending = JSON.parse(fs.readFileSync("data.json"));
    console.log(`📦 Đã khôi phục ${Object.keys(pending).length} ảnh chờ xác minh`);
  }
});

// ==== KHI NGƯỜI DÙNG GỬI ẢNH ====
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

// ==== XỬ LÝ PHẢN ỨNG ✅ ❌ ====
client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;

    const messageId = reaction.message.id;
    const targetUserId = pending[messageId];
    if (!targetUserId) return;

    const guild = reaction.message.guild;
    const memberReacting = await guild.members.fetch(user.id);

    // 🔐 CHỈ ADMIN MỚI ĐƯỢC PHẢN ỨNG XÁC MINH
    if (!memberReacting.permissions.has(PermissionsBitField.Flags.Administrator)) {
      console.log(`⛔ ${user.tag} không có quyền xác minh.`);
      return;
    }

    const targetMember = await guild.members.fetch(targetUserId);
    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

    if (reaction.emoji.name === "✅") {
      await targetMember.roles.add(VERIFIED_ROLE_ID);
      await reaction.message.reply(`<@${targetUserId}> đã được xác minh ✅`);
      console.log(`✅ Đã cấp role cho ${targetUserId}`);

      if (logChannel) {
        logChannel.send(`✅ **<@${targetUserId}> đã được xác minh bởi <@${user.id}>**`);
      }
    } else if (reaction.emoji.name === "❌") {
      await reaction.message.reply(`<@${targetUserId}> bị từ chối xác minh ❌`);
      console.log(`❌ Từ chối xác minh ${targetUserId}`);

      if (logChannel) {
        logChannel.send(`❌ **<@${targetUserId}> bị từ chối bởi <@${user.id}>**`);
      }
    }

    delete pending[messageId];
    fs.writeFileSync("data.json", JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error("❗ Lỗi khi xử lý reaction:", err);
  }
});

// ==== CHẠY BOT ====
client.login(process.env.TOKEN);
