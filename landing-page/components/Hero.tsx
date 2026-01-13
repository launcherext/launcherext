import React from 'react';
import ExtensionMockup from './ExtensionMockup';
import { Download, Terminal, ChevronRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
      
      {/* Left Content */}
      <div className="flex-1 text-center lg:text-left space-y-8">
        <div className="inline-flex items-center space-x-2 bg-brand-dark border border-brand-green/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            <span className="text-brand-green text-xs font-bold uppercase tracking-wider">v1.0 Now Available on Chrome Store</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Launch Memecoins <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-600">
            Instantly.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
          The ultimate Chrome extension for <span className="text-white font-semibold">pump.fun</span>. Generate AI banners, manage wallets, and launch tokens directly from your browser sidebar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="https://github.com/launcherext/launcherext" target="_blank" rel="noopener noreferrer" className="group relative bg-brand-green hover:bg-brand-greenDim text-brand-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] flex items-center justify-center gap-3">
                <Download className="w-5 h-5" />
                Download Extension
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
            
            <a href="https://github.com/launcherext/launcherext" target="_blank" rel="noopener noreferrer" className="bg-brand-dark hover:bg-gray-800 border border-gray-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                <Terminal className="w-5 h-5 text-gray-400" />
                View Source
            </a>
        </div>

        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm font-mono">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span>Chrome Store Verified</span>
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                <span>Audited Source</span>
            </div>
        </div>
      </div>

      {/* Right Content - Visual */}
      <div className="flex-1 w-full flex justify-center lg:justify-end relative">
         {/* Background Elements behind mockup */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green/20 blur-[100px] rounded-full pointer-events-none"></div>
         
         {/* Decorative Logo Background */}
         <img src="/logo.png" className="absolute -top-20 -right-20 w-64 h-64 opacity-10 blur-sm -rotate-12 pointer-events-none" alt="" />
         
         <ExtensionMockup />
      </div>

    </section>
  );
};

export default Hero;