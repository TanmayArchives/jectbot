import { Context } from 'telegraf';
import { prisma } from '@repo/database';
import { Web3Service } from '@repo/web3';
import { logger } from '@repo/web3/utils/logger';

const web3Service = new Web3Service();

export const defiCommands = {
  pool: async (ctx: Context) => {
    try {
      const [_, poolAddress] = ctx.message.text.split(' ');
      
      if (!poolAddress) {
        await ctx.reply('Usage: /pool <pool_address>');
        return;
      }

      const poolInfo = await web3Service.defi.getLiquidityPoolInfo(poolAddress);
      
      await ctx.reply(
        `Pool Info:\nReserve 0: ${poolInfo.reserve0}\nReserve 1: ${poolInfo.reserve1}`
      );
    } catch (error) {
      logger.error('Pool command error', { error });
      await ctx.reply('Failed to fetch pool information');
    }
  },

  farms: async (ctx: Context) => {
    try {
      const telegramId = ctx.from?.id.toString();
      if (!telegramId) return;

      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: { wallets: { where: { isMain: true } } }
      });

      if (!user?.wallets[0]) {
        await ctx.reply('Please set a main wallet first with /setwallet');
        return;
      }

      const positions = await web3Service.defi.getYieldFarmingPositions(
        user.wallets[0].address
      );

      if (positions.length === 0) {
        await ctx.reply('No active farming positions found');
        return;
      }

      const positionsText = positions
        .map(pos => `Pool: ${pos.pool}\nStaked: ${pos.staked}\nRewards: ${pos.rewards}`)
        .join('\n\n');

      await ctx.reply(`Your Farming Positions:\n\n${positionsText}`);
    } catch (error) {
      logger.error('Farms command error', { error });
      await ctx.reply('Failed to fetch farming positions');
    }
  },

  autocompound: async (ctx: Context) => {
    try {
      const [_, poolAddress] = ctx.message.text.split(' ');
      const telegramId = ctx.from?.id.toString();

      if (!telegramId || !poolAddress) {
        await ctx.reply('Usage: /autocompound <pool_address>');
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

      await web3Service.defi.autoCompound(poolAddress, user.wallets[0].address);
      await ctx.reply('Auto-compound enabled for the specified pool');
    } catch (error) {
      logger.error('Autocompound command error', { error });
      await ctx.reply('Failed to enable auto-compound');
    }
  }
}; 