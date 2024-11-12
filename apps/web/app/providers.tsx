"use client";
import { useState } from 'react';
import Link from 'next/link';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-background-secondary text-text transition-all duration-300 border-r border-gray-800`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-primary">currency_bitcoin</span>
            <h1 className={`text-xl font-bold ${!isSidebarOpen && 'hidden'}`}>CryptoBot</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-6 p-2 hover:bg-background-tertiary rounded-lg w-full flex items-center justify-center"
          >
            <span className="material-icons">
              {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>
        <nav className="mt-8">
          <Link 
            href="/" 
            className="flex items-center px-6 py-3 hover:bg-background-tertiary transition-colors"
          >
            <span className="material-icons text-text-secondary">dashboard</span>
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link 
            href="/trading" 
            className="flex items-center px-6 py-3 hover:bg-background-tertiary transition-colors"
          >
            <span className="material-icons text-text-secondary">swap_horiz</span>
            {isSidebarOpen && <span className="ml-3">Trading</span>}
          </Link>
          <Link 
            href="/portfolio" 
            className="flex items-center px-6 py-3 hover:bg-background-tertiary transition-colors"
          >
            <span className="material-icons text-text-secondary">account_balance_wallet</span>
            {isSidebarOpen && <span className="ml-3">Portfolio</span>}
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
        <header className="bg-background-secondary border-b border-gray-800 py-4 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center">
                <span className="material-icons mr-2">add</span>
                Connect Wallet
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 