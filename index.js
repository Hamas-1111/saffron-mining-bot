const { Telegraf } = require("telegraf");
const http = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
res.writeHead(200, { "Content-Type": "text/plain" });
res.end("SAFFRON Mining Bot is running!");
});

server.listen(PORT, "0.0.0.0", () => {
console.log("Web server running on port ${PORT}");
});

if (!process.env.BOT_TOKEN) {
console.error("BOT_TOKEN is missing.");
process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
ctx.reply(
"🌟 Welcome to SAFFRON Mining!\n\n" +
"Your SAF mining dashboard is ready.\n\n" +
"Use /home to open the main menu."
);
});

bot.command("home", (ctx) => {
ctx.reply(
"🌟 SAFFRON MINING\n\n" +
"⛏ Mining: Demo mode\n" +
"💰 Balance: 0 SAF\n" +
"🏆 Levels: 500\n\n" +
"/mine - Mining information\n" +
"/balance - Check balance\n" +
"/levels - View level system\n" +
"/help - Help"
);
});

bot.command("mine", (ctx) => {
ctx.reply("⛏ Mining is currently in demo mode. No real SAF is being earned.");
});

bot.command("balance", (ctx) => {
ctx.reply("💰 Your demo balance: 0 SAF");
});

bot.command("levels", (ctx) => {
ctx.reply("🏆 SAFFRON has 500 planned levels across five leagues.");
});

bot.help((ctx) => {
ctx.reply("/home\n/mine\n/balance\n/levels");
});

bot.catch((err) => {
console.error("Bot error:", err);
});

bot.launch()
.then(() => console.log("SAFFRON bot started"))
.catch((err) => {
console.error("Bot failed to start:", err);
});

process.once("SIGINT", () => {
bot.stop("SIGINT");
server.close();
});

process.once("SIGTERM", () => {
bot.stop("SIGTERM");
server.close();
});
