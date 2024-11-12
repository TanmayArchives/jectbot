"use client";
import { useEffect, useState } from 'react';
import { WalletBalance } from './WalletBalance';
import { TokenList } from './TokenList';
import { TradeHistory } from './TradeHistory';

interface Wallet {
  id: number;
  address: string;
  name?: string;
  balance: string;
}

export function Dashboard({ userId }: { userId: number }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wallets`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setWallets(data as Wallet[]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load wallet data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade">
      <section className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Wallets</h2>
          <button className="button button-primary">
            <span className="material-icons mr-2">add</span>
            Add Wallet
          </button>
        </div>
        
        {wallets.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-[#1F2A40] rounded-lg">
            <span className="material-icons text-4xl mb-2">account_balance_wallet</span>
            <p>No wallets found. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {wallets.map(wallet => (
              <WalletBalance 
                key={wallet.address} 
                address={wallet.address} 
              />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Trading</h2>
          <button className="button button-secondary">
            <span className="material-icons mr-2">history</span>
            View All
          </button>
        </div>
        <TokenList />
        <TradeHistory userId={userId} />
      </section>
    </div>
  );
} 