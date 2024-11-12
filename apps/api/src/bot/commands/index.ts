import { Context } from 'telegraf';
import { prisma } from '@repo/database';
import { Web3Service } from '@repo/web3';
import { logger } from '@repo/web3';

const web3Service = new Web3Service();

export const commandHandlers = {
    start: async (ctx: Context) => {
        const telegramId = ctx.from?.id.toString();
        if (!telegramId) return;

        try {
            await prisma.user.upsert({
                where: { telegramId },
                create: { telegramId },
                update: {}
            });

            await ctx.reply(
                'Welcome to CryptoBot! 🚀\n\n' +
                'Available commands:\n' +
                '/createwallet - Create a new wallet\n' +
                '/balance - Check your balances\n' +
                '/price <token> - Check token price\n' +
                '/swap <tokenIn> <tokenOut> <amount> - Swap tokens'
            );
        } catch (error) {
            logger.error('Error in start command:', error);
            await ctx.reply('Sorry, there was an error processing your request.');
        }
    },

    createwallet: async (ctx: Context) => {
        const telegramId = ctx.from?.id.toString();
        if (!telegramId) return;

        try {
            const wallet = await web3Service.createWallet();
            
            await prisma.wallet.create({
                data: {
                    address: wallet.address,
                    user: {
                        connect: { telegramId }
                    }
                }
            });

            await ctx.reply(
                `✅ Wallet created successfully!\n\n` +
                `Address: \`${wallet.address}\`\n\n` +
                `🔒 Private Key: \`${wallet.privateKey}\`\n\n` +
                `⚠️ Keep your private key safe and never share it with anyone!`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            logger.error('Error in createwallet command:', error);
            await ctx.reply('Sorry, there was an error creating your wallet.');
        }
    },

    balance: async (ctx: Context) => {
        const telegramId = ctx.from?.id.toString();
        if (!telegramId) return;

        try {
            const user = await prisma.user.findUnique({
                where: { telegramId },
                include: { wallets: true }
            });

            if (!user?.wallets.length) {
                return await ctx.reply(
                    'You don\'t have any wallets yet!\n' +
                    'Use /createwallet to create one.'
                );
            }

            const balancePromises = user.wallets.map(async wallet => {
                try {
                    const balance = await web3Service.getBalance(wallet.address);
                    return `${wallet.address}: ${balance} ETH`;
                } catch (error) {
                    logger.error('Error getting balance for wallet:', { address: wallet.address, error });
                    return `${wallet.address}: Error fetching balance`;
                }
            });

            const balances = await Promise.all(balancePromises);

            await ctx.reply(
                '💰 Your Balances:\n\n' +
                balances.join('\n')
            );
        } catch (error) {
            logger.error('Error in balance command:', error);
            await ctx.reply('Sorry, there was an error checking your balances.');
        }
    },

    price: async (ctx: Context) => {
        const message = ctx.message as any;
        const token = message?.text?.split(' ')[1];
        
        if (!token) {
            return await ctx.reply('Please provide a token address.\nUsage: /price <token_address>');
        }

        try {
            const price = await web3Service.priceMonitor.getPrice(token);
            await ctx.reply(`💲 Price: $${price}`);
        } catch (error) {
            logger.error('Error in price command:', error);
            await ctx.reply('Sorry, there was an error fetching the price.');
        }
    }
}; 