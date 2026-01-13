import React from 'react';
import clsx from 'clsx';
import LiveBadge from './LiveBadge';
import ProgressBar from './ProgressBar';
import StatBadge from './StatBadge';

interface TokenCardProps {
  image: string;
  name: string;
  symbol: string;
  marketCap: number;
  percentChange: number;
  isLive?: boolean;
  profitLoss?: number;
  onClick?: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({
  image,
  name,
  symbol,
  marketCap,
  percentChange,
  isLive,
  profitLoss,
  onClick,
}) => {
  const formatMarketCap = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-panel rounded-xl p-4',
        'cursor-pointer hover:scale-[1.02] transition-transform duration-300',
        'flex flex-col gap-3 group relative overflow-hidden'
      )}
    >
      <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      {/* Token Image and Live Badge */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full aspect-square object-cover rounded-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiM4ODgiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkpI8L3RleHQ+PC9zdmc+';
          }}
        />
        {isLive && (
          <div className="absolute top-2 right-2">
            <LiveBadge />
          </div>
        )}
      </div>

      {/* Token Info */}
      <div>
        <h3 className="font-black text-lg text-white truncate group-hover:text-brand-green transition-colors">{name}</h3>
        <p className="text-gray-400 text-xs font-mono tracking-wider">${symbol}</p>
      </div>

      {/* Market Cap with Progress */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Market Cap</span>
          <span className="text-text-primary font-semibold monospace">{formatMarketCap(marketCap)}</span>
        </div>
        <ProgressBar value={Math.min((marketCap / 100000) * 100, 100)} />
      </div>

      {/* Stats */}
      <div className="flex gap-2">
        <StatBadge
          label="24h"
          value={`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`}
          positive={percentChange >= 0}
        />
        {profitLoss !== undefined && (
          <StatBadge
            label="P/L"
            value={`${profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} SOL`}
            positive={profitLoss >= 0}
          />
        )}
      </div>
    </div>
  );
};

export default TokenCard;
