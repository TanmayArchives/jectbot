import { Web3 } from 'web3';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export class GasService {
  private web3: Web3;
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.web3 = new Web3(rpcUrl);
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async getGasEstimates() {
    try {
      const [baseFee, priorityFee] = await Promise.all([
        this.provider.getGasPrice(),
        this.provider.getFeeData()
      ]);

      return {
        slow: {
          baseFee: baseFee.toString(),
          priorityFee: '1000000000' // 1 gwei
        },
        normal: {
          baseFee: baseFee.toString(),
          priorityFee: priorityFee.maxPriorityFeePerGas?.toString() || '1500000000'
        },
        fast: {
          baseFee: baseFee.toString(),
          priorityFee: (BigInt(priorityFee.maxPriorityFeePerGas?.toString() || '0') * BigInt(2)).toString()
        }
      };
    } catch (error) {
      logger.error('Error getting gas estimates', { error });
      throw new Error('Failed to get gas estimates');
    }
  }

  async optimizeGasPrice(urgency: 'slow' | 'normal' | 'fast' = 'normal') {
    try {
      const estimates = await this.getGasEstimates();
      return estimates[urgency];
    } catch (error) {
      logger.error('Error optimizing gas price', { error });
      throw new Error('Failed to optimize gas price');
    }
  }

  async estimateGasLimit(tx: any) {
    try {
      const gasLimit = await this.provider.estimateGas(tx);
      // Add 20% buffer for safety
      return (gasLimit * BigInt(120) / BigInt(100)).toString();
    } catch (error) {
      logger.error('Error estimating gas limit', { error });
      throw new Error('Failed to estimate gas limit');
    }
  }
} 