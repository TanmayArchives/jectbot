import { Context } from 'telegraf';
import { prisma } from '@repo/database';
import { Web3Service } from '@repo/web3';
import { logger } from '@repo/web3/utils/logger';

const web3Service = new Web3Service();

export const tradingCommands = {
  swap: async (ctx: Context) => {
    try {
      const [_, tokenIn, tokenOut, amount] = ctx.message.text.split(' ');
      const telegramId = ctx.from?.id.toString();

      if (!telegramId || !tokenIn || !tokenOut || !amount) {
        await ctx.reply('Usage: /swap <tokenIn> <tokenOut> <amount>');
        return;
      }

      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: { wallets: { where: { isMain: true } } }
      });

      if (!user?.wallets[0]) {
        await ctx.reply('Please set a main wallet first with /setwallet');
        return;
      }

      const quote = await web3Service.dex.getQuote({
        tokenIn,
        tokenOut,
        amount,
        slippage: 0.5
      });

      await ctx.reply(`Estimated output: ${quote}\nReply with /confirm to execute trade`);
    } catch (error) {
      logger.error('Swap command error', { error });
      await ctx.reply('Failed to get swap quote');
    }
  },

  price: async (ctx: Context) => {
    try {
      const [_, token] = ctx.message.text.split(' ');
      
      if (!token) {
        await ctx.reply('Usage: /price <token_address>');
        return;
      }

      const securityCheck = await web3Service.security.scanToken(token);
      
      if (securityCheck.isHoneypot) {
        await ctx.reply('⚠️ Warning: This token appears to be a honeypot!');
        return;
      }

      // Add token to price monitor
      web3Service.priceMonitor.addToken(token);
      const price = await web3Service.priceMonitor.fetchPrice(token);

      await ctx.reply(`Current price: ${price} ETH`);
    } catch (error) {
      logger.error('Price command error', { error });
      await ctx.reply('Failed to fetch price');
    }
  },

  alert: async (ctx: Context) => {
    try {
      const [_, token, condition, value] = ctx.message.text.split(' ');
      const telegramId = ctx.from?.id.toString();

      if (!telegramId || !token || !condition || !value) {
        await ctx.reply('Usage: /alert <token_address> <above|below> <price>');
        return;
      }

      web3Service.priceMonitor.setAlert({
        tokenAddress: token,
        condition: condition as 'above' | 'below',
        value: parseFloat(value),
        callback: async (price) => {
          await ctx.reply(`🚨 Alert: ${token} price is ${condition} ${value}! Current price: ${price}`);
        }
      });

      await ctx.reply('Price alert set successfully!');
    } catch (error) {
      logger.error('Alert command error', { error });
      await ctx.reply('Failed to set price alert');
    }
  }
}; 