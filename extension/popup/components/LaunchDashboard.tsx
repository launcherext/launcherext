import React, { useState, useEffect, useCallback } from 'react';
import TokenCard from './ui/TokenCard';
import PrimaryButton from './ui/PrimaryButton';
import Toast from './ui/Toast';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { statsService } from '../../lib/stats';
import type { LaunchData, LaunchWithStats } from '../../types';

const LaunchDashboard: React.FC = () => {
  const [launches, setLaunches] = useState<LaunchWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'profitable' | 'loss'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'gain' | 'loss'>('recent');
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load launches on mount
  useEffect(() => {
    loadLaunches();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, launches]);

  const loadLaunches = async () => {
    setLoading(true);
    try {
      const savedLaunches = await storage.get<LaunchData[]>(STORAGE_KEYS.LAUNCHES);
      if (savedLaunches && savedLaunches.length > 0) {
        // Enrich with stats
        const enriched = await statsService.enrichMultipleLaunches(savedLaunches);
        setLaunches(enriched);
      }
    } catch (error) {
      console.error('Failed to load launches:', error);
      setToast({ message: 'Failed to load launches', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (launches.length === 0) return;

    setRefreshing(true);
    try {
      // Get base launch data
      const savedLaunches = await storage.get<LaunchData[]>(STORAGE_KEYS.LAUNCHES);
      if (savedLaunches && savedLaunches.length > 0) {
        // Enrich with updated stats
        const enriched = await statsService.enrichMultipleLaunches(savedLaunches);
        setLaunches(enriched);
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await refreshStats();
    setToast({ message: 'Stats refreshed!', type: 'success' });
  };

  // Calculate total P/L
  const totalPL = launches.reduce((sum, launch) => sum + (launch.profitLoss || 0), 0);
  const profitableCount = launches.filter((l) => (l.profitLoss || 0) > 0).length;

  // Filter launches
  const filteredLaunches = launches.filter((launch) => {
    if (filter === 'all') return true;
    if (filter === 'profitable') return (launch.profitLoss ?? 0) > 0;
    if (filter === 'loss') return (launch.profitLoss ?? 0) < 0;
    return true;
  });

  // Sort launches
  const sortedLaunches = [...filteredLaunches].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.launchedAt - a.launchedAt;
    } else if (sortBy === 'gain') {
      return (b.profitLoss || 0) - (a.profitLoss || 0);
    } else if (sortBy === 'loss') {
      return (a.profitLoss || 0) - (b.profitLoss || 0);
    }
    return 0;
  });

  const isLive = (timestamp: number) => {
    const hoursSinceLaunch = (Date.now() - timestamp) / (1000 * 60 * 60);
    return hoursSinceLaunch < 24;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {/* Header with Stats */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
         
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Portfolio Value</h2>
               <div className={`text-3xl font-black tracking-tight font-mono ${
                  totalPL > 0 ? 'text-brand-green text-glow' : totalPL < 0 ? 'text-red-500' : 'text-white'
                }`}>
                  {totalPL >= 0 ? '+' : ''}{totalPL.toFixed(4)} SOL
                </div>
          </div>
          
           <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                autoRefresh
                  ? 'bg-brand-green text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                  : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
              title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-black animate-pulse' : 'bg-current'}`}></div>
            </button>
            <button
               onClick={handleRefresh}
               disabled={refreshing}
               className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
               🔄
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 relative z-10">
             <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                 {launches.length} Tokens
             </div>
             <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                 {profitableCount} Profitable
             </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {(['all', 'profitable', 'loss'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f
                  ? 'bg-brand-green/10 border-brand-green text-brand-green shadow-[0_0_10px_rgba(0,255,136,0.1)]'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-xs text-text-muted self-center">Sort by:</span>
          {([
            { value: 'recent', label: 'Recent' },
            { value: 'gain', label: 'Top Gainers' },
            { value: 'loss', label: 'Top Losers' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                sortBy === value
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Token Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-accent-green border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary">Loading your launches...</p>
        </div>
      ) : sortedLaunches.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-white/10">
          <div className="text-5xl mb-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">🚀</div>
          <p className="text-gray-400 font-medium mb-2">
            {filter === 'all' 
              ? 'Ready for Liftoff'
              : filter === 'profitable'
              ? 'No Moonshots Yet'
              : 'All Systems Nominal'}
          </p>
          <p className="text-xs text-gray-600 font-mono">
            {filter === 'all'
              ? 'Launch your first token to begin tracking'
              : 'Adjust filters to view data'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sortedLaunches.map((launch) => (
            <TokenCard
              key={launch.id}
              image={launch.imageUrl || ''}
              name={launch.name}
              symbol={launch.symbol}
              marketCap={launch.stats?.marketCap || 0}
              percentChange={launch.stats?.percentChange24h || 0}
              isLive={isLive(launch.launchedAt)}
              profitLoss={launch.profitLoss}
              onClick={() => {
                window.open(`https://pump.fun/${launch.mint}`, '_blank');
              }}
            />
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LaunchDashboard;
