import React from 'react';
import { Download, Wallet, Rocket } from 'lucide-react';

const steps = [
  {
    title: 'Install Extension',
    description: 'Add Launch Ext to your Chrome browser from the web store. It lives in your sidebar for instant access.',
    icon: <Download className="w-8 h-8 text-brand-green" />,
  },
  {
    title: 'Connect Wallet',
    description: 'Securely link your Phantom or Solflare wallet, or generate a fresh embedded burner wallet with one click.',
    icon: <Wallet className="w-8 h-8 text-brand-green" />,
  },
  {
    title: 'Generate & Launch',
    description: 'Use our AI to create professional banners, fill in your token details, and launch directly to pump.fun.',
    icon: <Rocket className="w-8 h-8 text-brand-green" />,
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative z-10 py-24 px-4 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How it <span className="text-brand-green">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Three simple steps to go from idea to launch on Solana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-brand-green/30 to-transparent -translate-x-12 z-0"></div>
              )}
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-dark border border-gray-800 flex items-center justify-center mb-6 group-hover:border-brand-green transition-colors shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
