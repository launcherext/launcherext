import React from 'react';
import { Wallet, Settings, Rocket, Sparkles, X, Menu } from 'lucide-react';

const ExtensionMockup: React.FC = () => {
  return (
    <div className="relative w-[320px] mx-auto animate-float">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-green to-blue-600 rounded-xl blur opacity-30"></div>
      
      {/* Main Container */}
      <div className="relative bg-brand-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        
        {/* Header */}
        <div className="bg-brand-dark p-3 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-white tracking-wide">Launch Ext</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-brand-green"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-4">
            
            {/* Wallet Status */}
            <div className="flex justify-between items-center bg-brand-dark p-2 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                    <span className="text-xs text-gray-300 font-mono">5H...jK9s</span>
                </div>
                <span className="text-xs text-brand-green font-bold">12.5 SOL</span>
            </div>

            {/* AI Generation Input */}
            <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase">AI Banner Prompt</label>
                <div className="relative">
                    <textarea 
                        className="w-full bg-brand-dark border border-gray-700 rounded-lg p-3 text-xs text-gray-300 resize-none focus:outline-none focus:border-brand-green h-20"
                        placeholder="A cyberpunk frog smoking a cigar on the moon..."
                        readOnly
                    />
                    <button className="absolute bottom-2 right-2 bg-brand-green/10 p-1 rounded hover:bg-brand-green/20">
                        <Sparkles className="w-4 h-4 text-brand-green" />
                    </button>
                </div>
            </div>

            {/* Generated Image Preview (Placeholder) */}
            <div className="w-full h-32 bg-brand-dark rounded-lg border border-dashed border-gray-700 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand-green transition-colors">
                 <img 
                    src="https://picsum.photos/300/150?grayscale" 
                    alt="AI Gen" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" 
                 />
                 <span className="relative z-10 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Generated Preview</span>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
                <button className="w-full bg-brand-green hover:bg-brand-greenDim text-black font-extrabold py-3 rounded-lg uppercase tracking-wider text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                    Launch Token 🚀
                </button>
            </div>
        </div>

        {/* Footer Nav */}
        <div className="bg-brand-dark border-t border-gray-800 p-3 flex justify-around">
            <div className="flex flex-col items-center gap-1 text-brand-green cursor-pointer">
                <Rocket className="w-4 h-4" />
                <span className="text-[10px]">Launch</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-white cursor-pointer transition-colors">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px]">Wallet</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-white cursor-pointer transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-[10px]">Settings</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExtensionMockup;