import React from 'react';
import type { TokenMetadata } from '../../../types';
import type { BannerStyle } from './VisualStyleSelector';
import LiveBadge from './LiveBadge';

type PreviewStatus = 'idle' | 'generating' | 'ready' | 'error';

interface LivePreviewPaneProps {
  metadata: Partial<TokenMetadata>;
  style: BannerStyle;
  imageData: string | null;
  pfpData: string | null;
  previewStatus: PreviewStatus;
  validationErrors: string[];
}

const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
  metadata,
  style,
  imageData,
  pfpData,
  previewStatus,
  validationErrors,
}) => {
  const hasErrors = validationErrors.length > 0;

  return (
    <div className="sticky top-6 h-fit space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Live Preview</h3>
        <LiveBadge isLive={previewStatus === 'generating'} />
      </div>

      {/* Token Card Preview */}
      <div
        className="relative bg-background-secondary border-2 border-border rounded-3xl overflow-hidden transition-all duration-300"
        style={{
          boxShadow: previewStatus === 'ready' && !hasErrors
            ? '0 12px 32px rgba(0, 255, 163, 0.2), 0 0 0 1px rgba(0, 255, 163, 0.1)'
            : hasErrors
            ? '0 8px 24px rgba(239, 68, 68, 0.15)'
            : '0 6px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Banner Area */}
        <div className="relative w-full aspect-[2/1] bg-gradient-to-br from-background-tertiary to-background-primary">
          {previewStatus === 'generating' ? (
            // AI Thinking Animation
            <AIThinkingAnimation />
          ) : imageData ? (
            // Generated Image
            <img
              src={imageData}
              alt="Token banner preview"
              className="w-full h-full object-cover animate-fadeIn"
            />
          ) : (
            // Placeholder with style hint
            <StylePlaceholder style={style} />
          )}

          {/* PFP Overlay (positioned like pump.fun) */}
          {pfpData && (
            <div className="absolute -bottom-8 left-4">
              <div className="w-16 h-16 rounded-full border-4 border-background-primary overflow-hidden shadow-lg">
                <img
                  src={pfpData}
                  alt="Token PFP"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Token Info Overlay */}
        <div className="p-4 pt-10">
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="text-lg font-bold text-text-primary truncate">
              {metadata.name || 'Token Name'}
            </h4>
            <span className="text-sm text-text-muted monospace">
              ${metadata.symbol || 'SYM'}
            </span>
          </div>

          <p className="text-xs text-text-secondary line-clamp-2 mb-3">
            {metadata.description || 'Token description will appear here...'}
          </p>

          {/* Mock Stats */}
          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-background-tertiary rounded-lg">
            <div>
              <div className="text-xs text-text-muted">Market Cap</div>
              <div className="text-sm font-bold text-text-primary">$0</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Holders</div>
              <div className="text-sm font-bold text-text-primary">0</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">24h</div>
              <div className="text-sm font-bold text-success">+0%</div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {previewStatus !== 'idle' && (
          <div className="absolute top-2 right-2">
            <PreviewStatusBadge status={previewStatus} />
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {hasErrors && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-2">
            <span className="text-base">⚠</span>
            <span>Missing Required Fields</span>
          </div>
          <ul className="space-y-1.5">
            {validationErrors.map((error, i) => (
              <li key={i} className="text-sm text-red-300/80 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400/50" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {previewStatus === 'ready' && !hasErrors && (
        <div className="p-4 bg-gradient-to-br from-accent-green/10 to-green-500/5 border border-accent-green/30 rounded-2xl text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-accent-green">
            <span className="text-lg">✓</span>
            <span>Ready to Launch</span>
          </div>
        </div>
      )}
    </div>
  );
};

// AI Thinking Animation Component
const AIThinkingAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background-tertiary">
      {/* Neural Network Effect */}
      <div className="relative w-32 h-32">
        {/* Animated nodes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-accent-green rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
        
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-accent-green/20 rounded-full animate-ping" />
          <div className="absolute text-2xl">🧠</div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-xs text-text-muted">
        AI is cooking...
      </div>
    </div>
  );
};

// Style Placeholder Component
const StylePlaceholder: React.FC<{ style: BannerStyle }> = ({ style }) => {
  const gradients: Record<BannerStyle, string> = {
    degen: 'from-green-400/20 to-emerald-600/20',
    cosmic: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
    retro: 'from-orange-400/20 to-rose-500/20',
    anime: 'from-pink-400/20 to-purple-500/20',
    cyberpunk: 'from-cyan-400/20 via-blue-500/20 to-purple-600/20',
    minimal: 'from-gray-300/20 to-gray-500/20',
    vaporwave: 'from-pink-300/20 via-purple-300/20 to-cyan-300/20',
    pixelart: 'from-green-500/20 to-lime-400/20',
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradients[style]} flex items-center justify-center`}>
      <div className="text-4xl opacity-30">🎨</div>
    </div>
  );
};

// Preview Status Badge
const PreviewStatusBadge: React.FC<{ status: PreviewStatus }> = ({ status }) => {
  const config = {
    generating: { text: 'Generating...', color: 'bg-yellow-500', icon: '⚡' },
    ready: { text: 'Ready', color: 'bg-success', icon: '✓' },
    error: { text: 'Error', color: 'bg-error', icon: '✕' },
    idle: { text: 'Idle', color: 'bg-text-muted', icon: '○' },
  };

  const { text, color, icon } = config[status];

  return (
    <div className={`${color} text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1`}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default LivePreviewPane;
