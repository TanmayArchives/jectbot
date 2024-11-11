import { Telegraf } from 'telegraf';
import { config } from '../config';
import { commandHandlers } from './commands';

export const bot = new Telegraf(config.BOT_TOKEN);


Object.entries(commandHandlers).forEach(([command, handler]) => {
  bot.command(command, handler);
});