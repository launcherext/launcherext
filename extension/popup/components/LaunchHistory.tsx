import React, { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import type { LaunchData } from '../../types';

const LaunchHistory: React.FC = () => {
  const [launches, setLaunches] = useState<LaunchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const savedLaunches = await storage.get<LaunchData[]>(STORAGE_KEYS.LAUNCHES);
      if (savedLaunches) {
        // Sort by most recent first
        const sorted = [...savedLaunches].sort((a, b) => b.launchedAt - a.launchedAt);
        setLaunches(sorted);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Launch History</h2>
          <p className="text-text-secondary">View all your token launches</p>
        </div>
        <button
          onClick={loadHistory}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading...</div>
      ) : launches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No launch history</p>
          <p className="text-sm text-text-muted">Your token launches will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {launches.map((launch) => (
            <div
              key={launch.id}
              className="glass-panel rounded-xl p-4 hover:border-brand-green/30 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => window.open(`https://solscan.io/tx/${launch.signature}`, '_blank')}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
               
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 font-bold text-lg">
                        {launch.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-brand-green transition-colors">{launch.name}</h3>
                      <p className="text-gray-500 text-xs font-mono tracking-wide">${launch.symbol}</p>
                    </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">{formatDate(launch.launchedAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1 font-bold">Mint Address</div>
                  <div className="text-xs font-mono text-brand-green bg-brand-green/5 px-2 py-1 rounded border border-brand-green/10 inline-block">{formatAddress(launch.mint)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1 font-bold">Dev Buy</div>
                  <div className="text-xs font-mono font-bold text-white">{launch.devBuyAmount} SOL</div>
                </div>
              </div>

              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://pump.fun/${launch.mint}`, '_blank');
                  }}
                  className="flex-1 px-3 py-1.5 bg-brand-green text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all hover:bg-brand-green-dim hover:scale-[1.02]"
                >
                  View on Pump
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://solscan.io/tx/${launch.signature}`, '_blank');
                  }}
                  className="flex-1 px-3 py-1.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all hover:bg-white/20 hover:scale-[1.02]"
                >
                  View TX
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaunchHistory;
