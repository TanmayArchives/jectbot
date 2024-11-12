import { useState } from 'react';
import { Web3Service } from '@repo/web3';

export function useWeb3() {
    const [balance, setBalance] = useState<string>('0');
    const web3Service = new Web3Service();

    const getBalance = async (address: string) => {
        try {
            const balance = await web3Service.getBalance(address);
            setBalance(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    };

    return { balance, getBalance, web3Service };
}