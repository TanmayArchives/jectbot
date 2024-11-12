"use client";
import { useState, useEffect, ChangeEvent } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { TokenSelector } from './TokenSelector';
import { TradePreview } from './TradePreview';
import { PriceChart } from './PriceChart';
import { SecurityInfo } from './SecurityInfo';

export function TradingInterface() {
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { web3Service } = useWeb3();

  useEffect(() => {
    const getQuote = async () => {
      if (!tokenIn || !tokenOut || !amount) return;
      
      setLoading(true);
      try {
        const quoteData = await web3Service.dex.getQuote({
          tokenIn,
          tokenOut,
          amount,
          slippage: 0.5
        });
        setQuote(quoteData);
      } catch (error) {
        console.error('Error getting quote:', error);
      } finally {
        setLoading(false);
      }
    };

    getQuote();
  }, [tokenIn, tokenOut, amount]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleTrade = async () => {
    if (!quote) return;
    
    try {
      const tx = await web3Service.dex.executeTrade({
        tokenIn,
        tokenOut,
        amount,
        slippage: 0.5,
        wallet: 'user_wallet_address' // Get from context/state
      });
      
      // Handle successful trade
    } catch (error) {
      // Handle error
      console.error('Trade failed:', error);
    }
  };

  return (
    <div className="trading-interface">
      <div className="trading-container">
        <TokenSelector
          value={tokenIn}
          onChange={setTokenIn}
          label="From"
        />
        <TokenSelector
          value={tokenOut}
          onChange={setTokenOut}
          label="To"
        />
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Amount"
        />
        <button 
          onClick={handleTrade}
          disabled={!quote || loading}
        >
          {loading ? 'Loading...' : 'Swap'}
        </button>
      </div>
      
      {quote && <TradePreview quote={quote} />}
      <PriceChart tokenAddress={tokenOut} />
      <SecurityInfo tokenAddress={tokenOut} />
    </div>
  );
} 