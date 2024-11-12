import { Telegraf } from 'telegraf';
import { config } from '../config';
import { commandHandlers } from './commands';
import { logger } from '@repo/web3';

export const bot = new Telegraf(config.BOT_TOKEN);

// Initialize commands
Object.entries(commandHandlers).forEach(([command, handler]) => {
  bot.command(command, handler);
  logger.info(`Registered command: /${command}`);
});

// Start the bot immediately
bot.launch()
  .then(() => {
    logger.info('Bot commands initialized');
    logger.info('Telegram bot started successfully');
  })
  .catch((error) => {
    logger.error('Failed to start Telegram bot:', error);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));