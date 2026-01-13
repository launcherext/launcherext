import React, { useState } from 'react';
import TabNavigation from './components/ui/TabNavigation';
import CreateTokenModal from './components/CreateTokenModal';
import TokenCreationForm from './components/TokenCreationForm';
import LaunchDashboard from './components/LaunchDashboard';
import LaunchHistory from './components/LaunchHistory';
import WalletManager from './components/WalletManager';

type Tab = 'dashboard' | 'history';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleLaunchSuccess = () => {
    setCreateModalOpen(false);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-green selection:text-black">
      {/* Header */}
      <header className="bg-[#050505]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl border border-white/10 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.1)] group-hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all">
            <img 
              src="public/rocket-logo.png" 
              alt="Launch Ext" 
              className="w-full h-full object-contain drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none mb-0.5">LAUNCH <span className="text-brand-green text-glow">EXT</span></h1>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Systems Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Create Token Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="premium-button px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 group"
          >
            <span className="text-base group-hover:rotate-12 transition-transform">✨</span>
            Create
          </button>
          
          <WalletManager />
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="p-6 overflow-y-auto" style={{ height: 'calc(800px - 120px)' }}>
        {activeTab === 'dashboard' && <LaunchDashboard />}
        {activeTab === 'history' && <LaunchHistory />}
      </main>

      {/* Create Token Modal */}
      <CreateTokenModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <TokenCreationForm onSuccess={handleLaunchSuccess} />
      </CreateTokenModal>
    </div>
  );
};

export default App;
