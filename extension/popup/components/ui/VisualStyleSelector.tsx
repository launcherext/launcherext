import React from 'react';

export type BannerStyle =
  | 'degen'
  | 'cosmic'
  | 'retro'
  | 'anime'
  | 'cyberpunk'
  | 'minimal'
  | 'vaporwave'
  | 'pixelart';

interface StyleOption {
  value: BannerStyle;
  label: string;
  gradient: string; // Tailwind gradient classes
  emoji: string;
  description: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    value: 'degen',
    label: 'Degen',
    gradient: 'from-green-400 to-emerald-600',
    emoji: '🐸',
    description: 'Pepe-core meme energy',
  },
  {
    value: 'cosmic',
    label: 'Cosmic',
    gradient: 'from-purple-500 via-pink-500 to-blue-500',
    emoji: '🌌',
    description: 'Interstellar vibes',
  },
  {
    value: 'retro',
    label: 'Retro',
    gradient: 'from-orange-400 to-rose-500',
    emoji: '📼',
    description: '80s synthwave',
  },
  {
    value: 'anime',
    label: 'Anime',
    gradient: 'from-pink-400 to-purple-500',
    emoji: '⚡',
    description: 'Kawaii energy',
  },
  {
    value: 'cyberpunk',
    label: 'Cyberpunk',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    emoji: '🤖',
    description: 'Neon dystopia',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    gradient: 'from-gray-300 to-gray-500',
    emoji: '⚪',
    description: 'Clean & modern',
  },
  {
    value: 'vaporwave',
    label: 'Vaporwave',
    gradient: 'from-pink-300 via-purple-300 to-cyan-300',
    emoji: '🌴',
    description: 'A E S T H E T I C',
  },
  {
    value: 'pixelart',
    label: 'Pixel Art',
    gradient: 'from-green-500 to-lime-400',
    emoji: '🎮',
    description: '8-bit nostalgia',
  },
];

interface VisualStyleSelectorProps {
  selectedStyle: BannerStyle;
  onStyleSelect: (style: BannerStyle) => void;
}

const VisualStyleSelector: React.FC<VisualStyleSelectorProps> = ({
  selectedStyle,
  onStyleSelect,
}) => {
  return (
    <div>
      <label className="block text-base font-semibold text-text-primary mb-4">
        Art Style
      </label>
      <div className="grid grid-cols-4 gap-4">
        {STYLE_OPTIONS.map((style) => {
          const isSelected = selectedStyle === style.value;
          return (
            <button
              key={style.value}
              onClick={() => onStyleSelect(style.value)}
              className={`
                relative group overflow-hidden rounded-2xl transition-all duration-300
                ${
                  isSelected
                    ? 'ring-2 ring-accent-green shadow-lg shadow-accent-green/30 scale-105'
                    : 'hover:scale-[1.03] hover:shadow-md ring-1 ring-border'
                }
              `}
              style={{
                aspectRatio: '1',
              }}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-3">
                <div className="text-4xl mb-2">{style.emoji}</div>
                <div className="text-sm font-bold text-white drop-shadow-lg">
                  {style.label}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
              )}

              {/* Hover Description */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent text-white text-xs py-2 px-2 text-center transform translate-y-full group-hover:translate-y-0 transition-all duration-200">
                {style.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VisualStyleSelector;
export { STYLE_OPTIONS };
export type { StyleOption };
