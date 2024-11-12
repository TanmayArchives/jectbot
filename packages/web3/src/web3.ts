import { Web3 } from 'web3';
import { ethers } from 'ethers';
import { config } from './config';
import { SecurityScanner } from './services/SecurityScanner';
import { DexService } from './services/DexService';
import { PriceMonitor } from './services/PriceMonitor';
import { RiskMonitor } from './services/RiskMonitor';
import { ApiService } from './services/ApiService';
import { logger } from './utils/logger';

export class Web3Manager {
  private web3: Web3;
  private provider: ethers.JsonRpcProvider;
  public security: SecurityScanner;
  public dex: DexService;
  public priceMonitor: PriceMonitor;
  public risk: RiskMonitor;
  public api: ApiService;

  constructor(rpcUrl: string = config.RPC_URL) {
    try {
      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {
        headers: [
          {
            name: 'Authorization',
            value: `Bearer ${process.env.RPC_API_KEY || ''}`
          }
        ]
      }));
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.security = new SecurityScanner(rpcUrl);
      this.dex = new DexService(rpcUrl);
      this.priceMonitor = new PriceMonitor();
      this.risk = new RiskMonitor(rpcUrl);
      this.api = new ApiService(config.API_URL);
    } catch (error) {
      logger.error('Error initializing Web3Manager:', error);
      throw new Error('Failed to initialize Web3 services');
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting balance:', { address, error });
      throw new Error('Failed to get balance');
    }
  }

  async createWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      logger.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }
} 