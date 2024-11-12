import { useWeb3 } from '../hooks/useWeb3';
import { useEffect } from 'react';
export function WalletBalance({ address }: { address: string }) {
    const { balance, getBalance } = useWeb3();
    useEffect(() => {
        getBalance(address);
    }, [address]);

    return (
        <div>
            <h2>Wallet Balance</h2>
            <p>{balance} ETH</p>
        </div>
    );
}