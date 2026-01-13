import React from 'react';
import clsx from 'clsx';

interface TabNavigationProps {
  activeTab: 'dashboard' | 'history';
  onTabChange: (tab: 'dashboard' | 'history') => void;
}

const tabs = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
  { id: 'history' as const, label: 'History', icon: '📜' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-[#050505] border-b border-white/5 py-4 px-4 sticky top-[73px] z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300',
              'font-bold text-xs uppercase tracking-wider',
              activeTab === tab.id
                ? 'bg-brand-green text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
