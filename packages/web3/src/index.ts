export * from './web3';
export * from './services/SecurityScanner';
export * from './services/DexService';
export * from './services/PriceMonitor';
export * from './services/RiskMonitor';
export * from './services/WebSocketService';
export * from './utils/logger';
export * from './config';

import { Web3Manager } from './web3';
import { config } from './config';

export class Web3Service extends Web3Manager {
  constructor() {
    super(config.RPC_URL);
  }
}