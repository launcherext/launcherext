import React, { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { walletFactory } from '../../lib/wallet';
import type { WalletState } from '../../types';
import PrimaryButton from './ui/PrimaryButton';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Toast from './ui/Toast';

const WalletManager: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    type: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [showEmbeddedModal, setShowEmbeddedModal] = useState(false);
  const [embeddedMode, setEmbeddedMode] = useState<'create' | 'import'>('create');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const savedWallet = await storage.get<WalletState>(STORAGE_KEYS.WALLET);
    if (savedWallet) {
      // Re-fetch balance to ensure it's up to date
      try {
        const externalWallet = walletFactory.createExternal();
        const balance = await externalWallet.getBalance(savedWallet.address!);
        setWallet({ ...savedWallet, balance });
      } catch (error) {
        console.warn('RPC Balance update failed:', error);
        setWallet(savedWallet);
      }
    }
  };

  const connectPhantom = async () => {
    setLoading(true);
    try {
      const externalWallet = walletFactory.createExternal();
      await externalWallet.connectPhantom();
      await loadWallet();
      setShowModal(false);
      setToast({ message: 'Phantom wallet connected!', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to connect', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const connectSolflare = async () => {
    setLoading(true);
    try {
      const externalWallet = walletFactory.createExternal();
      await externalWallet.connectSolflare();
      await loadWallet();
      setShowModal(false);
      setToast({ message: 'Solflare wallet connected!', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to connect', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createEmbeddedWallet = async () => {
    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const embeddedWallet = walletFactory.createEmbedded();
      const { publicKey, secretKey } = embeddedWallet.create();
      await embeddedWallet.save(password);
      
      setShowEmbeddedModal(false);
      setShowModal(false);
      await loadWallet();
      
      // Show secret key in toast for backup (in production, show in a better UI)
      console.log('Backup your private key:', secretKey);
      setToast({ message: 'Wallet created! Check console for backup.', type: 'success' });
      
      resetForms();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to create wallet', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const importEmbeddedWallet = async () => {
    if (!privateKey.trim()) {
      setToast({ message: 'Please enter your private key', type: 'error' });
      return;
    }

    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const embeddedWallet = walletFactory.createEmbedded();
      embeddedWallet.import(privateKey);
      await embeddedWallet.save(password);
      
      setShowEmbeddedModal(false);
      setShowModal(false);
      await loadWallet();
      setToast({ message: 'Wallet imported successfully!', type: 'success' });
      
      resetForms();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to import wallet', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (wallet.type === 'external') {
      const externalWallet = walletFactory.createExternal();
      await externalWallet.disconnect();
    } else if (wallet.type === 'embedded') {
      const embeddedWallet = walletFactory.createEmbedded();
      await embeddedWallet.clear();
    }

    setWallet({
      connected: false,
      address: null,
      balance: 0,
      type: null,
    });
    setToast({ message: 'Wallet disconnected', type: 'success' });
  };

  const resetForms = () => {
    setPassword('');
    setConfirmPassword('');
    setPrivateKey('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      {wallet.connected && wallet.address ? (
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-3">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Balance</div>
                <div className="text-xs font-bold text-brand-green font-mono text-glow">
                {wallet.balance.toFixed(2)} SOL
                </div>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-2 glass-panel hover:bg-white/5 rounded-lg text-xs font-mono text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10"
            title="Disconnect"
          >
            {formatAddress(wallet.address)}
          </button>
        </div>
      ) : (
        <PrimaryButton 
            onClick={() => setShowModal(true)}
            className="premium-button px-4 py-1.5 text-xs rounded-lg"
        >
          Connect Wallet
        </PrimaryButton>
      )}

      {/* Main Wallet Modal */}
      <Modal
        isOpen={showModal && !showEmbeddedModal}
        onClose={() => setShowModal(false)}
        title="Connect Wallet"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Choose how you want to connect your wallet to Launch Ext.
          </p>

          <div className="space-y-3">
            <button
              onClick={connectPhantom}
              disabled={loading}
              className="w-full p-4 glass-panel rounded-xl text-left transition-all hover:border-brand-green/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] group disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 bg-[#AB9FF2]/20 rounded-lg flex items-center justify-center text-[#AB9FF2]">👻</div>
                 <div className="font-bold text-white group-hover:text-brand-green transition-colors">Phantom Wallet</div>
              </div>
              <div className="text-xs text-gray-500 font-mono pl-11">
                Connect your Phantom wallet
              </div>
            </button>

            <button
              onClick={connectSolflare}
              disabled={loading}
              className="w-full p-4 glass-panel rounded-xl text-left transition-all hover:border-brand-green/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] group disabled:opacity-50"
            >
               <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 bg-[#FC7226]/20 rounded-lg flex items-center justify-center text-[#FC7226]">☀️</div>
                 <div className="font-bold text-white group-hover:text-brand-green transition-colors">Solflare Wallet</div>
              </div>
              <div className="text-xs text-gray-500 font-mono pl-11">
                Connect your Solflare wallet
              </div>
            </button>

            <button
              onClick={() => {
                setEmbeddedMode('create');
                setShowEmbeddedModal(true);
              }}
              className="w-full p-4 glass-panel rounded-xl text-left transition-all hover:border-brand-green/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] group"
            >
               <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green">✨</div>
                 <div className="font-bold text-white group-hover:text-brand-green transition-colors">Create New Wallet</div>
              </div>
              <div className="text-xs text-gray-500 font-mono pl-11">
                Generate a new wallet in the extension
              </div>
            </button>

            <button
              onClick={() => {
                setEmbeddedMode('import');
                setShowEmbeddedModal(true);
              }}
              className="w-full p-4 glass-panel rounded-xl text-left transition-all hover:border-brand-green/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] group"
            >
               <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">🔑</div>
                 <div className="font-bold text-white group-hover:text-brand-green transition-colors">Import Wallet</div>
              </div>
              <div className="text-xs text-gray-500 font-mono pl-11">
                Import an existing wallet with private key
              </div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Embedded Wallet Modal */}
      <Modal
        isOpen={showEmbeddedModal}
        onClose={() => {
          setShowEmbeddedModal(false);
          resetForms();
        }}
        title={embeddedMode === 'create' ? 'Create Wallet' : 'Import Wallet'}
      >
        <div className="space-y-4">
          {embeddedMode === 'import' && (
            <Input
              label="Private Key"
              type="password"
              placeholder="Enter your private key (base58)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          )}

          <Input
            label="Password"
            type="password"
            placeholder="Enter password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {embeddedMode === 'create' && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          <div className="bg-warning/10 border border-warning rounded-md p-3 text-sm text-warning">
            ⚠️ {embeddedMode === 'create' 
              ? 'Make sure to backup your private key. It will be shown once in the console.'
              : 'Your wallet will be encrypted with this password. Keep it safe!'}
          </div>

          <PrimaryButton
            onClick={embeddedMode === 'create' ? createEmbeddedWallet : importEmbeddedWallet}
            loading={loading}
            className="w-full"
          >
            {embeddedMode === 'create' ? 'Create Wallet' : 'Import Wallet'}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default WalletManager;
