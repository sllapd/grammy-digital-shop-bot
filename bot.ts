import { Bot, InlineKeyboard } from "grammy";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("Не вказано BOT_TOKEN у файлі .env");
}

const bot = new Bot(token);

// Каталог товарів
const products: Record<string, { title: string; price: string; desc: string }> = {
  spotify: {
    title: "🎵 Spotify Premium (1 місяць)",
    price: "120 грн",
    desc: "Індивідуальна підписка на ваш акаунт без реклами та з офлайн-режимом."
  },
  chatgpt: {
    title: "🤖 ChatGPT Plus (1 місяць)",
    price: "450 грн",
    desc: "Доступ до останніх моделей OpenAI, генерації зображень та аналізу файлів."
  },
  youtube: {
    title: "▶️ YouTube Premium (1 місяць)",
    price: "110 грн",
    desc: "Перегляд відео без реклами, фонове відтворення та YouTube Music."
  }
};

// Головне меню
const mainMenu = new InlineKeyboard()
  .text("🛒 Каталог підписок", "catalog").row()
  .text("🛡 Гарантії та FAQ", "faq")
  .text("👨‍💻 Підтримка", "support");

bot.command("start", async (ctx) => {
  await ctx.reply(
    `Вітаємо у *DigitalStore Bot*! 🚀\n\nТут ви можете автоматично замовити офіційні цифрові підписки з миттєвою активацією.\n\nОберіть потрібний розділ нижче:`,
    { parse_mode: "Markdown", reply_markup: mainMenu }
  );
});

// Перехід у каталог
bot.callbackQuery("catalog", async (ctx) => {
  const catalogKb = new InlineKeyboard()
    .text("🎵 Spotify Premium — 120 грн", "item_spotify").row()
    .text("🤖 ChatGPT Plus — 450 грн", "item_chatgpt").row()
    .text("▶️ YouTube Premium — 110 грн", "item_youtube").row()
    .text("⬅️ Назад у меню", "back_main");

  await ctx.editMessageText("📂 *Оберіть підписку з каталогу:*", {
    parse_mode: "Markdown",
    reply_markup: catalogKb
  });
  await ctx.answerCallbackQuery();
});

// Картка товару
bot.callbackQuery(/^item_(.+)$/, async (ctx) => {
  const key = ctx.match[1];
  const item = products[key];
  if (!item) return;

  const itemKb = new InlineKeyboard()
    .text("✅ Оформити замовлення", `buy_${key}`).row()
    .text("⬅️ Назад до каталогу", "catalog");

  await ctx.editMessageText(
    `*${item.title}*\n\n📝 ${item.desc}\n💰 Вартість: *${item.price}*\n⚡ Час видачі: 5–10 хвилин`,
    { parse_mode: "Markdown", reply_markup: itemKb }
  );
  await ctx.answerCallbackQuery();
});

// Оформлення та відправка заявки адміну
bot.callbackQuery(/^buy_(.+)$/, async (ctx) => {
  const key = ctx.match[1];
  const item = products[key];
  const user = ctx.from;

  const backKb = new InlineKeyboard().text("🏠 На головну", "back_main");

  await ctx.editMessageText(
    `🎉 *Заявку на "${item.title}" створено!*\n\nНомер замовлення: \`#${Math.floor(1000 + Math.random() * 9000)}\`\nДо сплати: *${item.price}*\n\nНаш менеджер уже отримав сповіщення і зв'яжеться з вами у цьому чаті для видачі доступу.`,
    { parse_mode: "Markdown", reply_markup: backKb }
  );

  // Сповіщення власнику (відправляється у той самий чат для зручної демонстрації)
  await ctx.api.sendMessage(
    user.id,
    `🔔 *[АДМІН-ПАНЕЛЬ] Нове замовлення!*\n👤 Покупець: ${user.first_name} (@${user.username || "без_ніка"})\n📦 Товар: ${item.title}\n💵 Сума: ${item.price}`,
    { parse_mode: "Markdown" }
  );

  await ctx.answerCallbackQuery("Замовлення відправлено!");
});

bot.callbackQuery("faq", async (ctx) => {
  const backKb = new InlineKeyboard().text("⬅️ Назад", "back_main");
  await ctx.editMessageText(
    "🛡 *Гарантії магазину:*\n\n1. Усі підписки оформлюються офіційно.\n2. Гарантія працює на весь термін оренди.\n3. Середній час видачі замовлення — 5 хвилин.",
    { parse_mode: "Markdown", reply_markup: backKb }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("support", async (ctx) => {
  const backKb = new InlineKeyboard().text("⬅️ Назад", "back_main");
  await ctx.editMessageText(
    "👨‍💻 З усіх питань пишіть адміністратору або залиште повідомлення прямо в цьому боті.",
    { reply_markup: backKb }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("back_main", async (ctx) => {
  await ctx.editMessageText(
    `Вітаємо у *DigitalStore Bot*! 🚀\n\nОберіть потрібний розділ нижче:`,
    { parse_mode: "Markdown", reply_markup: mainMenu }
  );
  await ctx.answerCallbackQuery();
});

console.log("🚀 DigitalStore Bot успішно запущено!");
bot.start();
