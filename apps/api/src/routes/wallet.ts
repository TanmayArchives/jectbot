import { Router } from 'express';
import { prisma } from '@repo/database';
import { Web3Service } from '@repo/web3';
import { authenticate } from '../middleware/auth';
import { validateAddress } from '../utils/validation';

const router = Router();
const web3Service = new Web3Service();

router.get('/:userId/wallets', authenticate, async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: parseInt(req.params.userId) }
    });

    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => ({
        ...wallet,
        balance: await web3Service.getBalance(wallet.address)
      }))
    );

    res.json(walletsWithBalances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

router.post('/:userId/wallets', authenticate, async (req, res) => {
  try {
    const { address, name } = req.body;
    
    if (!validateAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        name,
        userId: parseInt(req.params.userId)
      }
    });

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Make sure to export the router as default
export default router;