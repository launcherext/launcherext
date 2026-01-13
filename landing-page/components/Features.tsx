import React from 'react';
import { Feature } from '../types';
import { Rocket, Wand2, Wallet, LineChart, ShieldCheck, Zap } from 'lucide-react';
import ProfitChart from './ProfitChart';

const features: Feature[] = [
  {
    title: 'AI Banner Gen',
    description: 'Describe your meme idea and let our fine-tuned AI generate perfect 1:1 pixel art or illustrative banners instantly.',
    icon: <Wand2 className="w-6 h-6" />,
    color: 'text-purple-400'
  },
  {
    title: 'One-Click Launch',
    description: 'Bypass the slow UI. Launch directly to pump.fun via PumpPortal API optimized for speed and reliability.',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-brand-green'
  },
  {
    title: 'Dual Wallet Core',
    description: 'Connect your main Phantom wallet or generate a burner embedded wallet for high-speed degen plays.',
    icon: <Wallet className="w-6 h-6" />,
    color: 'text-blue-400'
  },
  {
    title: 'Real-time P/L',
    description: 'Track your launched tokens performance with an integrated P/L calculator that updates every block.',
    icon: <LineChart className="w-6 h-6" />,
    color: 'text-yellow-400'
  },
  {
    title: 'Bank-Grade Security',
    description: 'Private keys are encrypted locally using AES-256. We never access your funds or keys.',
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'text-red-400'
  },
  {
    title: 'Snipe Ready',
    description: 'Optimized RPC endpoints ensure your launch transaction lands in the very first block.',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-orange-400'
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative z-10 py-24 bg-brand-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to <span className="text-brand-green">Moon</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Stop fumbling with image editors and slow interfaces. Launch Ext streamlines the entire memecoin lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
                key={idx} 
                className="group bg-brand-dark p-6 rounded-2xl border border-gray-800 hover:border-brand-green/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-lg bg-black flex items-center justify-center mb-4 ${feature.color} border border-gray-800 group-hover:border-current`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
              
              {/* Special interactive element for P/L card */}
              {feature.title === 'Real-time P/L' && (
                  <ProfitChart />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;