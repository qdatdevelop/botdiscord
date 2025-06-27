require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// === THAY BẰNG ID BẠN ĐÃ CUNG CẤP ===
const VERIFY_CHANNEL_ID = '1388212621710332099';         // Kênh xác minh
const VERIFIED_ROLE_ID = '1388180240425156829';          // Role sẽ cấp
const ALLOWED_STAFF_IDS = ['1388192256791416975', '1388187078319407174']; // Admin hoặc Mod

// === DỮ LIỆU TẠM ===
let pending = {};

client.on('ready', () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);
  if (fs.existsSync('data.json')) {
    pending = JSON.parse(fs.readFileSync('data.json'));
  }
});

client.on('messageCreate', async (message) => {
  if (message.channel.id !== VERIFY_CHANNEL_ID || message.author.bot) return;

  if (message.attachments.size > 0) {
    pending[message.id] = message.author.id;
    fs.writeFileSync('data.json', JSON.stringify(pending));
    await message.react('✅');
    await message.react('❌');
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;

  const messageId = reaction.message.id;
  const userId = pending[messageId];
  if (!userId) return;

  const guild = reaction.message.guild;
  const adminId = user.id;
  if (!ALLOWED_STAFF_IDS.includes(adminId)) return; // Kiểm tra admin/mod

  const member = await guild.members.fetch(userId);

  if (reaction.emoji.name === '✅') {
    await member.roles.add(VERIFIED_ROLE_ID);
    await reaction.message.reply(`<@${userId}> đã được xác minh ✅`);
  } else if (reaction.emoji.name === '❌') {
    await reaction.message.reply(`<@${userId}> bị từ chối xác minh ❌`);
  }

  delete pending[messageId];
  fs.writeFileSync('data.json', JSON.stringify(pending));
});

client.login(process.env.TOKEN);
