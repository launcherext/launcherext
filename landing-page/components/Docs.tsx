import React, { useState } from 'react';
import { Book, ChevronRight, Terminal, Rocket, Wallet, Image, Zap, Shield, Code, Download, ExternalLink, Activity } from 'lucide-react';

const PremiumIcon = ({ icon: Icon, color = "green" }: { icon: any, color?: "green" | "purple" | "blue" | "red" | "orange" }) => {
  const colorMap = {
    green: "from-brand-green/20 to-emerald-600/20 text-brand-green",
    purple: "from-purple-500/20 to-indigo-600/20 text-purple-400",
    blue: "from-blue-500/20 to-cyan-600/20 text-blue-400",
    red: "from-red-500/20 to-rose-600/20 text-red-400",
    orange: "from-orange-500/20 to-amber-600/20 text-orange-400"
  };

  const borderMap = {
    green: "border-brand-green/20 group-hover:border-brand-green/50",
    purple: "border-purple-500/20 group-hover:border-purple-500/50",
    blue: "border-blue-500/20 group-hover:border-blue-500/50",
    red: "border-red-500/20 group-hover:border-red-500/50",
    orange: "border-orange-500/20 group-hover:border-orange-500/50"
  };

  const glowMap = {
    green: "shadow-[0_0_20px_rgba(0,255,136,0.15)] group-hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]",
    purple: "shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    blue: "shadow-[0_0_20px_rgba(96,165,250,0.15)] group-hover:shadow-[0_0_30px_rgba(96,165,250,0.3)]",
    red: "shadow-[0_0_20px_rgba(248,113,113,0.15)] group-hover:shadow-[0_0_30px_rgba(248,113,113,0.3)]",
    orange: "shadow-[0_0_20px_rgba(251,146,60,0.15)] group-hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]"
  };

  return (
    <div className={`relative p-3 rounded-xl bg-gradient-to-br border ${colorMap[color].split(' ')[0]} ${borderMap[color]} ${glowMap[color]} transition-all duration-500 group-hover:scale-105`}>
      <Icon className={`w-6 h-6 ${colorMap[color].split(' ').pop()}`} strokeWidth={2} />
      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <PremiumIcon icon={Rocket} color="green" />,
      content: (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
             <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] -z-10"></div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-brand-green/20 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                v1.0.0
              </span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Launch in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400 text-glow">Seconds.</span>
            </h2>
            <p className="text-gray-400 text-xl leading-relaxed max-w-2xl font-light">
              Launch Ext is your <span className="text-gray-200 font-medium">cheat code</span> for pump.fun. Skip the slow forms and launch tokens directly from your browser toolbar.
            </p>
          </div>
          
          <div className="glass-card rounded-3xl p-1 overflow-hidden">
            <div className="bg-[#050505]/90 backdrop-blur-2xl p-8 sm:p-12 space-y-10">
              <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                  <Rocket className="w-5 h-5" />
                </span>
                Quick Setup
              </h3>
              
              <div className="grid gap-6">
                {[
                  { title: "Get the Extension", desc: "Download from Chrome Web Store", icon: <Download className="w-5 h-5" /> },
                  { title: "Pin It", desc: "Click the 🧩 puzzle piece & pin Launch Ext", icon: <Activity className="w-5 h-5" /> },
                  { title: "Launch", desc: "Open the sidebar & create your coin", icon: <Zap className="w-5 h-5" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-green/30 hover:bg-white/[0.04] transition-all group cursor-pointer hover:shadow-[0_0_30px_rgba(0,255,136,0.05)]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-green/50 transition-all shadow-lg">
                      <span className="text-brand-green group-hover:text-glow transition-all">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xl mb-1 group-hover:text-brand-green transition-colors">{item.title}</h4>
                      <p className="text-gray-400 text-base">{item.desc}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                        <ChevronRight className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'wallet-management',
      title: 'Wallets',
      icon: <PremiumIcon icon={Wallet} color="purple" />,
      content: (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <span className="bg-purple-500/10 text-purple-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                Security
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              Your Keys, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 text-glow">Your Crypto.</span>
            </h2>
            <p className="text-gray-400 text-xl leading-relaxed max-w-2xl font-light">
              We leverage standard local encryption. Your private keys never leave your device.
            </p>
          </div>

           <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-8 border-t-4 border-t-purple-500 hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-purple-400" />
                  Supported Wallets
              </h3>
              <div className="flex flex-wrap gap-3">
                 {['Phantom', 'Backpack', 'Solflare'].map(wallet => (
                    <div key={wallet} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-default flex items-center gap-2 group">
                        <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:shadow-[0_0_8px_#a855f7] transition-all"></div>
                        <span className="font-bold text-gray-200">{wallet}</span>
                    </div>
                 ))}
                 <div className="px-5 py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 text-sm flex items-center gap-2 hover:border-gray-500 transition-colors">
                    <span>+ More</span>
                 </div>
              </div>
            </div>
             <div className="glass-card rounded-3xl p-8 border-t-4 border-t-red-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-500" />
                    Safety First
                </h3>
                <p className="text-gray-400 mb-8 text-lg font-light">
                    We recommend using burner wallets for high-risk degen plays. Keep your main stash cold.
                </p>
                <div className="flex items-center gap-3 text-red-400 text-sm font-bold bg-red-500/10 px-5 py-4 rounded-xl border border-red-500/20">
                    <Shield className="w-5 h-5 animate-pulse" />
                    Burner wallets recommended
                </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-banner',
      title: 'AI Studio',
      icon: <PremiumIcon icon={Image} color="blue" />,
      content: (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-6">
                    <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        Generator
                    </span>
                </div>
                <h2 className="text-6xl font-black text-white mb-8 tracking-tighter">
                    Infinite <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 text-glow">Possibilities.</span>
                </h2>
                <p className="text-gray-400 text-xl font-light">Generate viral-worthy memecoin art in seconds.</p>
            </div>
            
            {/* Interactive Demo UI */}
             <div className="glass-card rounded-3xl border border-white/10 p-1 bg-[#050505]/80 backdrop-blur-2xl">
                <div className="bg-[#0a0a0a]/50 p-8 md:p-12 rounded-[20px] grid md:grid-cols-2 gap-10">
                     <div className="space-y-8">
                        <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prompt</label>
                                <span className="text-xs text-brand-green font-mono bg-brand-green/10 px-2 py-1 rounded border border-brand-green/20">AI-V2.0 ONLINE</span>
                             </div>
                            <div className="premium-input text-gray-300 min-h-[140px] border-l-4 border-l-blue-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] bg-black/80 font-mono text-sm leading-relaxed p-6 rounded-r-xl">
                                <span className="text-blue-500 select-none mr-2">$</span>
                                <span className="text-gray-100">A cyberpunk pepe frog</span>{'\n'}
                                <span className="text-blue-500 select-none mr-2">{'>'}</span>
                                <span className="text-gray-400">wearing neon sunglasses</span>{'\n'}
                                <span className="text-blue-500 select-none mr-2">{'>'}</span>
                                <span className="text-gray-400">riding a rocket</span>{'\n'}
                                <span className="text-blue-500 select-none mr-2">{'>'}</span>
                                <span className="text-gray-500">8k resolution, cinematic lighting_</span><span className="animate-pulse">|</span>
                            </div>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            GENERATE ART
                        </button>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden aspect-square border-2 border-dashed border-gray-800 bg-black/50 flex items-center justify-center group hover:border-blue-500/30 transition-colors">
                        <div className="text-center group-hover:opacity-0 transition-opacity absolute z-10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                <Image className="w-8 h-8 text-gray-600" />
                            </div>
                            <span className="text-gray-600 font-mono text-xs tracking-widest block">PREVIEW AREA</span>
                        </div>
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110"></div>
                         
                         {/* Floating Badges */}
                         <div className="absolute bottom-4 left-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">HD</span>
                            <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">1:1</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Help & Status',
      icon: <PremiumIcon icon={Terminal} color="red" />,
      content: (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <h2 className="text-6xl font-black text-white mb-8 tracking-tighter">
                     System <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 text-glow">Status.</span>
                 </h2>
            </div>
            
            <div className="grid gap-4">
               {[
                 { q: "Extension Missing?", a: "Check your Chrome extensions puzzle piece 🧩. It might be hidden." },
                 { q: "Wallet Not Connecting?", a: "Make sure your wallet is UNLOCKED before clicking connect." },
                 { q: "Transaction Failed?", a: "Solana congestion happens. Ensure you have 0.05+ SOL for rent/fees." }
               ].map((item, idx) => (
                 <details key={idx} className="glass-card rounded-2xl overflow-hidden group bg-[#050505]/60 hover:bg-[#0a0a0a]/80 transition-colors border border-white/5 open:border-brand-green/30 open:shadow-[0_0_20px_rgba(0,255,136,0.05)]">
                    <summary className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-colors select-none">
                      <span className="font-bold text-xl text-gray-200 group-open:text-brand-green transition-colors">{item.q}</span>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-open:rotate-90 group-open:text-brand-green transition-all" />
                    </summary>
                    <div className="px-6 pb-6 text-gray-400 text-base leading-relaxed border-t border-white/5 pt-4 font-mono bg-black/20">
                      <span className="text-brand-green mr-2">{">"}</span> {item.a}
                    </div>
                 </details>
               ))}
            </div>
        </div>
      )
    },
     {
      id: 'api-reference',
      title: 'API Reference',
      icon: <PremiumIcon icon={Code} color="orange" />,
      content: (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-6">
                    <span className="bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                        100x Devs
                    </span>
                </div>
                <h2 className="text-6xl font-black text-white mb-8 tracking-tighter">
                    Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 text-glow">Faster.</span>
                </h2>
            </div>

            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#050505] ring-1 ring-white/5">
                <div className="bg-[#0a0a0a] border-b border-white/5 p-4 flex items-center justify-between">
                    <div className="flex gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-colors"></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono tracking-wide">background.js</span>
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
                <div className="p-8 overflow-x-auto bg-[#030303] selection:bg-orange-900/30">
                    <pre className="text-sm font-mono leading-[1.8] text-gray-300">
                        <span className="text-purple-400 font-bold">chrome</span>.
                        <span className="text-blue-400 italic">runtime</span>.
                        <span className="text-yellow-400">sendMessage</span>
                        <span className="text-gray-500">(</span>
                        {'\n'}  <span className="text-brand-green">EXTENSION_ID</span>,
                        {'\n'}  {'{'}
                        {'\n'}    <span className="text-blue-300">action</span>: <span className="text-orange-400">"CREATE_TOKEN"</span>,
                        {'\n'}    <span className="text-blue-300">data</span>: {'{'}
                        {'\n'}      <span className="text-blue-300">name</span>: <span className="text-orange-400">"MoonRocket"</span>,
                        {'\n'}      <span className="text-blue-300">symbol</span>: <span className="text-orange-400">"MOON"</span>
                        {'\n'}    {'}'}
                        {'\n'}  {'}'}
                        <span className="text-gray-500">)</span>;
                    </pre>
                </div>
            </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection)?.content;

  return (
    <section id="docs" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Ambience */}
      <div className="fixed top-20 left-0 w-[800px] h-[800px] bg-brand-green/5 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen"></div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 sticky top-24">
          <nav className="glass-card rounded-2xl overflow-hidden p-3 space-y-2 sticky top-28">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 group relative overflow-hidden border ${
                  activeSection === section.id
                    ? 'bg-brand-green/5 border-brand-green/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                }`}
              >
                  <div className={`transition-all duration-300 ${activeSection === section.id ? 'scale-110' : 'scale-100'}`}>
                    {section.icon}
                  </div>
                  <div className="relative z-10 flex-1">
                      <span className={`block text-sm font-bold tracking-wide ${activeSection === section.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {section.title}
                      </span>
                      {activeSection === section.id && (
                        <span className="text-[10px] text-brand-green font-mono opacity-80 animate-in fade-in duration-300 hidden sm:block">
                            ● Active
                        </span>
                      )}
                  </div>
                  
                  {/* Active Indicator Bar */}
                  {activeSection === section.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green shadow-[0_0_10px_#00ff88]"></div>
                  )}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-6 glass-card rounded-2xl text-center border border-brand-green/20 relative overflow-hidden group">
             <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative z-10">
                 <div className="w-3 h-3 rounded-full bg-brand-green animate-pulse mx-auto mb-3 shadow-[0_0_10px_brand-green]"></div>
                 <h4 className="font-bold text-white text-sm mb-1">Systems Online</h4>
                 <div className="text-xs text-gray-500 font-mono">v1.2.0-stable</div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 min-h-[600px]">
             {activeContent}
        </main>
      </div>
    </section>
  );
};

export default Docs;
