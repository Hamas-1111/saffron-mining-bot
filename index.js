const { Telegraf, Markup } = require("telegraf");
const http = require("http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const MINI_APP_URL = "https://saffron-mining-bot.onrender.com";

const bot = new Telegraf(process.env.BOT_TOKEN);

const users = {};

const MINING_TIME = 24 * 60 * 60 * 1000;
const MINING_REWARD = 10;

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      balance: 0,
      miningStartedAt: null
    };
  }
  return users[id];
}

function appButton() {
  return Markup.inlineKeyboard([
    [
      Markup.button.webApp(
        "🚀 Open SAFFRON App",
        MINI_APP_URL
      )
    ]
  ]);
}

// Website server
http.createServer((req, res) => {
  const filePath = path.join(
    __dirname,
    "public",
    "index.html"
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("SAFFRON Mini App loading error");
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log("SAFFRON Mini App server running on port " + PORT);
});

// Start command
bot.start((ctx) => {
  getUser(ctx.from.id);

  ctx.reply(
    "👑 Welcome to SAFFRON MINING!\n\n" +
    "Mine • Earn • Grow\n\n" +
    "Tap below to open your SAFFRON dashboard.",
    appButton()
  );
});

// Home command
bot.command("home", (ctx) => {
  const user = getUser(ctx.from.id);

  ctx.reply(
    "👑 SAFFRON MINING\n\n" +
    "💰 Balance: " + user.balance + " SAF\n\n" +
    "⛏ /startmining - Start Mining\n" +
    "📊 /mine - Mining Status\n" +
    "🎁 /claim - Claim Reward\n" +
    "💎 /balance - Check Balance\n\n" +
    "Open your dashboard below.",
    appButton()
  );
});

// Start mining
bot.command("startmining", (ctx) => {
  const user = getUser(ctx.from.id);

  if (user.miningStartedAt) {
    return ctx.reply(
      "⛏ Mining is already running.\nUse /mine to check status."
    );
  }

  user.miningStartedAt = Date.now();

  ctx.reply(
    "✅ SAFFRON demo mining started!\n\n" +
    "⏰ Duration: 24 Hours\n" +
    "🎁 Demo Reward: 10 SAF\n\n" +
    "Use /mine to check progress."
  );
});

// Mining status
bot.command("mine", (ctx) => {
  const user = getUser(ctx.from.id);

  if (!user.miningStartedAt) {
    return ctx.reply(
      "⛏ Mining is not running.\nUse /startmining to begin."
    );
  }

  const elapsed = Date.now() - user.miningStartedAt;
  const remaining = MINING_TIME - elapsed;

  if (remaining <= 0) {
    return ctx.reply(
      "🎉 Your 24-hour demo mining session is complete!\n" +
      "Use /claim to collect your demo reward."
    );
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  ctx.reply(
    "⛏ SAFFRON Mining Status\n\n" +
    "⏳ Time Remaining: " +
    hours + "h " + minutes + "m " + seconds + "s\n\n" +
    "🎁 Reward: 10 SAF"
  );
});

// Claim reward
bot.command("claim", (ctx) => {
  const user = getUser(ctx.from.id);

  if (!user.miningStartedAt) {
    return ctx.reply(
      "You have no completed mining session."
    );
  }

  const elapsed = Date.now() - user.miningStartedAt;

  if (elapsed < MINING_TIME) {
    const remaining = MINING_TIME - elapsed;
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    return ctx.reply(
      "⏳ Mining is not complete yet.\n" +
      "Remaining: " + hours + "h " + minutes + "m"
    );
  }

  user.balance += MINING_REWARD;
  user.miningStartedAt = null;

  ctx.reply(
    "🎉 DEMO REWARD CLAIMED!\n\n" +
    "💰 Earned: 10 SAF\n" +
    "💎 Total Balance: " + user.balance + " SAF\n\n" +
    "Use /startmining to start again."
  );
});

// Balance
bot.command("balance", (ctx) => {
  const user = getUser(ctx.from.id);

  ctx.reply(
    "💰 Your SAFFRON Demo Balance: " +
    user.balance + " SAF"
  );
});

// Help
bot.command("help", (ctx) => {
  ctx.reply(
    "👑 SAFFRON MINING HELP\n\n" +
    "/start - Start Bot\n" +
    "/home - Main Menu\n" +
    "/startmining - Start Mining\n" +
    "/mine - Mining Status\n" +
    "/claim - Claim Reward\n" +
    "/balance - Check Balance"
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot Error:", err);
});

// Launch bot
bot.launch()
  .then(() => console.log("SAFFRON Mining Bot Started"))
  .catch((err) => console.error("Launch Error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
