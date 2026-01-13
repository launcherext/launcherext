import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Coin } from '../types';

const MOCK_COINS: Coin[] = [
  { name: 'PepeRocket', symbol: '$PEPER', image: 'https://picsum.photos/32/32?random=1', marketCap: '$1.2M', change: 154.2 },
  { name: 'DogeWifHat', symbol: '$DWH', image: 'https://picsum.photos/32/32?random=2', marketCap: '$450K', change: 23.5 },
  { name: 'MoonCat', symbol: '$MCAT', image: 'https://picsum.photos/32/32?random=3', marketCap: '$89K', change: -12.4 },
  { name: 'SolanaSummer', symbol: '$SUM', image: 'https://picsum.photos/32/32?random=4', marketCap: '$2.1M', change: 312.8 },
  { name: 'BonkKiller', symbol: '$KILL', image: 'https://picsum.photos/32/32?random=5', marketCap: '$12K', change: 5.1 },
  { name: 'PumpIt', symbol: '$PUMP', image: 'https://picsum.photos/32/32?random=6', marketCap: '$670K', change: 89.2 },
  { name: 'SafeElon', symbol: '$ELON', image: 'https://picsum.photos/32/32?random=7', marketCap: '$3.4M', change: 44.1 },
  { name: 'BasedGod', symbol: '$BASED', image: 'https://picsum.photos/32/32?random=8', marketCap: '$150K', change: -5.6 },
];

const Ticker: React.FC = () => {
  return (
    <div className="w-full bg-brand-dark border-b border-brand-gray/50 py-2 relative z-10 overflow-hidden">
        <div className="marquee-container">
            <div className="marquee-content flex gap-8 items-center px-4">
                {[...MOCK_COINS, ...MOCK_COINS, ...MOCK_COINS].map((coin, idx) => (
                    <div key={`${coin.symbol}-${idx}`} className="flex items-center space-x-2 text-sm">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full border border-gray-600" />
                        <span className="font-bold text-white">{coin.symbol}</span>
                        <span className={coin.change >= 0 ? 'text-brand-green flex items-center' : 'text-red-500 flex items-center'}>
                            {coin.change >= 0 ? '+' : ''}{coin.change}%
                        </span>
                        <span className="text-gray-500 text-xs">MC: {coin.marketCap}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Ticker;