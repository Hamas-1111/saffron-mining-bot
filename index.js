const { Telegraf } = require("telegraf");
const http = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const bot = new Telegraf(process.env.BOT_TOKEN);

const users = {};

const MINING_TIME = 24 * 60 * 60 * 1000;
const MINING_REWARD = 10;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("SAFFRON Mining Bot is running!");
}).listen(PORT, "0.0.0.0");

bot.start((ctx) => {
  ctx.reply(
    "🌟 Welcome to SAFFRON Mining!\n\n" +
    "Use /home to open your dashboard."
  );
});

bot.command("home", (ctx) => {
  ctx.reply(
    "🌟 SAFFRON MINING\n\n" +
    "⛏ Mining: Demo Mode\n" +
    "💰 Balance: " + (users[ctx.from.id]?.balance || 0) + " SAF\n\n" +
    "/startmining - Start Mining\n" +
    "/mine - Mining Status\n" +
    "/claim - Claim Reward\n" +
    "/balance - Check Balance\n"
  );
});

bot.command("startmining", (ctx) => {
  const id = ctx.from.id;

  if (!users[id]) {
    users[id] = { balance: 0, mining: false };
  }

  if (users[id].mining) {
    return ctx.reply("⛏ Your mining session is already active!");
  }

  users[id].mining = true;
  users[id].startTime = Date.now();

  ctx.reply(
    "⛏ SAFFRON MINING STARTED!\n\n" +
    "⏳ Mining Time: 24 Hours\n" +
    "🎁 Reward: 10 SAF\n\n" +
    "Use /mine to check your progress."
  );
});

bot.command("mine", (ctx) => {
  const user = users[ctx.from.id];

  if (!user || !user.mining) {
    return ctx.reply("⛏ Mining is not active. Use /startmining.");
  }

  const elapsed = Date.now() - user.startTime;
  const remaining = MINING_TIME - elapsed;

  if (remaining <= 0) {
    return ctx.reply("🎉 Mining completed! Use /claim to collect your reward.");
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);

  ctx.reply(
    "⛏ SAFFRON MINING STATUS\n\n" +
    "⏳ Remaining: " + hours + " hours " + minutes + " minutes\n" +
    "🎁 Reward: 10 SAF"
  );
});

bot.command("claim", (ctx) => {
  const user = users[ctx.from.id];

  if (!user || !user.mining) {
    return ctx.reply("❌ No active mining session.");
  }

  if (Date.now() - user.startTime < MINING_TIME) {
    return ctx.reply("⏳ Mining is not completed yet!");
  }

  user.balance += MINING_REWARD;
  user.mining = false;

  ctx.reply(
    "🎉 REWARD CLAIMED!\n\n" +
    "💰 Earned: 10 SAF\n" +
    "💎 Total Balance: " + user.balance + " SAF\n\n" +
    "Use /startmining to start again."
  );
});

bot.command("balance", (ctx) => {
  const balance = users[ctx.from.id]?.balance || 0;
  ctx.reply("💰 Your SAFFRON Balance: " + balance + " SAF");
});

bot.command("help", (ctx) => {
  ctx.reply(
    "/home - Main Menu\n" +
    "/startmining - Start Mining\n" +
    "/mine - Mining Status\n" +
    "/claim - Claim Reward\n" +
    "/balance - Check Balance"
  );
});

bot.catch((err) => console.error("Bot Error:", err));

bot.launch()
  .then(() => console.log("SAFFRON Mining Bot Started"))
  .catch(console.error);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
