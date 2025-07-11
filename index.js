require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const handlers = require("./config/handlers");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
  ],
});

// ==== Web giữ bot sống ====
app.get("/", (req, res) => res.send("✅ Bot đang hoạt động!"));
app.listen(PORT);

// ==== Khi bot online ====
client.once("ready", async () => {
  console.log(`🌐 Web server đang chạy tại cổng ${PORT}`);
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);

  // ==== Chạy các tác vụ khởi động ====
  for (const handler of handlers) {
    if (handler.runOnReady && typeof handler.onReady === "function") {
      try {
        console.log(`${handler.icon} Đang chạy: ${handler.name}`);
        await handler.onReady(client); // ✅ Gọi đúng hàm
        console.log(`${handler.icon} ✅ Xong: ${handler.name}`);
      } catch (err) {
        console.error(`❌ Lỗi khi chạy ${handler.name}: ${err.message}`);
      }
    }
  }

  // ==== Sau khi bot chạy mới đăng ký sự kiện ====
  for (const handler of handlers) {
    if (handler.event) {
      client.on(handler.event, (...args) => {
        try {
          handler.handler.execute(...args); // ✅ Gọi đúng method execute
        } catch (err) {
          console.error(`❌ Lỗi trong ${handler.name}: ${err.message}`);
        }
      });
      console.log(
        `${handler.icon} 📩 Đăng ký sự kiện ${handler.event}: ${handler.name}`,
      );
    }
  }
});

// ==== Khởi động bot ====
client.login(process.env.TOKEN);
