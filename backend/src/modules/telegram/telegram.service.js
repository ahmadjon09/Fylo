import { Telegraf } from 'telegraf';
import { env } from '../../config/env.js';
import User from '../users/user.model.js';

let bot = null;

if (env.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    bot.start((ctx) => ctx.reply(
      `Салом! Fylo тизимига хуш келибсиз!\n\n` +
      `Сизнинг Telegram ID: ${ctx.from.id}\n` +
      `Бу ID ни Fylo профилингизда сақланг, шунда янги маҳсулот ва сотувлар ҳақида хабарнома оласиз.\n\n` +
      `Бот: @FyloRobot\n` +
      `Лойиҳа: Fylo — Омбор бошқаруви\n\n` +
      `/myid — ID ни кўриш`
    ));
    bot.command('myid', (ctx) => ctx.reply(`Сизнинг Telegram ID: ${ctx.from.id}\n\nFylo профилингизга шу ID ни қўшинг.`));
    bot.command('help', (ctx) => ctx.reply(
      `Fylo — Омбор ва Савдо Тизими\n\n` +
      `Буйруқлар:\n` +
      `/start — Бошлаш\n` +
      `/myid — Telegram ID\n` +
      `/help — Ёрдам\n\n` +
      `Бот: @FyloRobot\n` +
      `Лойиҳа: Fylo`
    ));
    bot.launch().then(() => console.log('Fylo Telegram bot @FyloRobot launched')).catch((e) => console.error('Telegram bot launch error', e.message));

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (e) {
    console.error('Failed to init telegram bot', e.message);
  }
} else {
  console.log('Telegram bot token not provided, skipping');
}

export const getBot = () => bot;

export const notifyAdmins = async (message) => {
  if (!bot) return;
  try {
    const admins = await User.find({ role: 'admin', telegramId: { $ne: null } }).select('telegramId').lean();
    const ids = admins.map((a) => a.telegramId).filter(Boolean);
    if (!ids.length) return;
    for (const id of ids) {
      try {
        await bot.telegram.sendMessage(id, message, { parse_mode: 'Markdown' });
      } catch (err) {
        if (err?.response?.error_code === 403) {
          console.log(`Telegram user ${id} has not started @FyloRobot, skipping`);
        }
      }
    }
  } catch (e) {
    console.error('notifyAdmins error', e.message);
  }
};

export const notifyUser = async (telegramId, message) => {
  if (!bot || !telegramId) return;
  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (e) {
    // 403 means user didn't start bot
  }
};
