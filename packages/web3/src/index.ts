export * from './web3'; 
export * from "./utils"

import { Web3 } from './web3';
import { config } from '../config';

export class web3Service {
    private web3: Web3;

    constructor() {
        this.web3 = new Web3(config.RPC_URL);
    }

    async getBalance(address: string) {
        const balance = await this.web3.eth.getBalance(address);
        return balance;
    }

}