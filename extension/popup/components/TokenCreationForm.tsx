import React, { useState, useEffect, useCallback, useRef } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import PrimaryButton from './ui/PrimaryButton';
import Toast from './ui/Toast';
import VisualStyleSelector, { type BannerStyle } from './ui/VisualStyleSelector';
import LivePreviewPane from './ui/LivePreviewPane';
import { apiClient } from '../../lib/api-client';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import type { TokenMetadata, WalletState } from '../../types';

interface TokenCreationFormProps {
  onSuccess?: () => void;
}

const TokenCreationForm: React.FC<TokenCreationFormProps> = ({ onSuccess }) => {
  // Form state
  const [metadata, setMetadata] = useState<Partial<TokenMetadata>>({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
  });
  
  const [style, setStyle] = useState<BannerStyle>('degen');
  const [prompt, setPrompt] = useState('');
  const [generatePfp, setGeneratePfp] = useState(false);
  const [devBuyAmount, setDevBuyAmount] = useState<string>('0.1');
  
  // Image state
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [pfpImage, setPfpImage] = useState<string | null>(null);
  
  // UI state
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [launchResult, setLaunchResult] = useState<{ mint: string; signature: string } | null>(null);
  
  // Debounce timer for auto-preview
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Validation
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!metadata.name?.trim()) errors.push('Token name is required');
    else if (metadata.name.length > 32) errors.push('Name must be ≤32 chars');
    
    if (!metadata.symbol?.trim()) errors.push('Symbol is required');
    else if (metadata.symbol.length > 10) errors.push('Symbol must be ≤10 chars');
    
    if (!metadata.description?.trim()) errors.push('Description is required');
    else if (metadata.description.length > 500) errors.push('Description must be ≤500 chars');
    
    return errors;
  }, [metadata]);

  const validationErrors = validateForm();
  const isFormValid = validationErrors.length === 0;

  // Update preview status based on form state
  useEffect(() => {
    if (loading) {
      setPreviewStatus('generating');
    } else if (bannerImage && isFormValid) {
      setPreviewStatus('ready');
    } else if (validationErrors.length > 0 && bannerImage) {
      setPreviewStatus('error');
    } else {
      setPreviewStatus('idle');
    }
  }, [loading, bannerImage, isFormValid, validationErrors.length]);

  // Handle metadata changes with real-time validation feedback
  const handleMetadataChange = (field: keyof TokenMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
    
    // If preview already exists, update preview status immediately for validation feedback
    if (bannerImage) {
      const updatedMetadata = { ...metadata, [field]: value };
      const errors = validateFormWithMetadata(updatedMetadata);
      if (errors.length === 0 && bannerImage) {
        setPreviewStatus('ready');
      } else if (errors.length > 0) {
        setPreviewStatus('error');
      }
    }
  };
  
  // Helper validation function that accepts metadata parameter
  const validateFormWithMetadata = (meta: Partial<TokenMetadata>): string[] => {
    const errors: string[] = [];
    
    if (!meta.name?.trim()) errors.push('Token name is required');
    else if (meta.name.length > 32) errors.push('Name must be ≤32 chars');
    
    if (!meta.symbol?.trim()) errors.push('Symbol is required');
    else if (meta.symbol.length > 10) errors.push('Symbol must be ≤10 chars');
    
    if (!meta.description?.trim()) errors.push('Description is required');
    else if (meta.description.length > 500) errors.push('Description must be ≤500 chars');
    
    return errors;
  };

  // Handle style selection (instant preview update)
  const handleStyleSelect = (newStyle: BannerStyle) => {
    setStyle(newStyle);
    
    // Auto-regenerate with new style if user already has a prompt and image
    if (bannerImage && prompt.trim()) {
      // Debounce the regeneration to avoid spamming API
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        handleGenerateImages();
      }, 800); // 800ms debounce for style changes
    }
  };
  
  // Debounced prompt change handler
  const handlePromptChange = (value: string) => {
    setPrompt(value);
    
    // If user already has a generated image, auto-regenerate after typing stops
    if (bannerImage && value.trim().length > 10) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        // Auto-regenerate only if prompt is substantial
        if (value.trim().length > 15) {
          handleGenerateImages();
        }
      }, 2000); // 2 second debounce for typing
    }
  };
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle image generation
  const handleGenerateImages = async () => {
    if (!metadata.name?.trim()) {
      setToast({ message: 'Please enter a token name first', type: 'error' });
      return;
    }

    if (!prompt.trim()) {
      setToast({ message: 'Please enter a creative prompt', type: 'error' });
      return;
    }

    setLoading(true);
    setPreviewStatus('generating');

    try {
      // Generate banner
      const bannerResult = await apiClient.generateBanner({
        tokenName: metadata.name,
        ticker: metadata.symbol,
        creativePrompt: prompt,
        style: style,
        outputType: 'banner'
      });
      setBannerImage(bannerResult.imageBase64);
      setMetadata((prev) => ({ ...prev, imageBase64: bannerResult.imageBase64 }));

      // Generate PFP if requested
      if (generatePfp) {
        const pfpPrompt = `Profile picture version of: ${prompt}`;
        const pfpResult = await apiClient.generateBanner({
          tokenName: metadata.name || '',
          ticker: metadata.symbol,
          creativePrompt: pfpPrompt,
          style: style,
          outputType: 'pfp'
        });
        setPfpImage(pfpResult.imageBase64);
      }

      setToast({ message: '✨ Images generated successfully!', type: 'success' });
      setPreviewStatus('ready');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate images';
      setToast({ message: errorMsg, type: 'error' });
      setPreviewStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setBannerImage(base64);
      setMetadata((prev) => ({ ...prev, imageBase64: base64 }));
      setToast({ message: 'Image uploaded!', type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  // Handle token launch
  const handleLaunch = async () => {
    if (!isFormValid) {
      setToast({ message: 'Please fix validation errors', type: 'error' });
      return;
    }

    if (!bannerImage) {
      setToast({ message: 'Please generate or upload a banner image', type: 'error' });
      return;
    }

    // Check wallet connection
    const wallet = await storage.get<WalletState>(STORAGE_KEYS.WALLET);
    if (!wallet?.connected || !wallet.address) {
      setToast({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    setLaunching(true);
    try {
      const { pumpPortalClient } = await import('../../lib/pumpportal');
      const { walletFactory } = await import('../../lib/wallet');

      const createParams = {
        metadata: metadata as TokenMetadata,
        devBuyAmount: parseFloat(devBuyAmount) || 0,
        slippage: 10,
        priorityFee: 0.0005,
      };

      let result;

      if (wallet.type === 'embedded') {
        const embeddedWallet = walletFactory.createEmbedded();
        const password = window.prompt('Enter wallet password to sign transaction:');
        if (!password) {
          setToast({ message: 'Transaction cancelled', type: 'error' });
          return;
        }

        await embeddedWallet.load(password);
        const keypair = embeddedWallet.getKeypair();
        
        result = await pumpPortalClient.createTokenWithWallet(
          createParams,
          wallet.address,
          async (tx) => {
            tx.sign([keypair]);
            return tx;
          }
        );
      } else if (wallet.type === 'external') {
        const externalWallet = walletFactory.createExternal();
        const provider = externalWallet.getProvider();

        result = await pumpPortalClient.createTokenWithWallet(
          createParams,
          wallet.address,
          async (tx) => {
            const signedTx = await provider.signTransaction(tx);
            return signedTx;
          }
        );
      }

      if (result?.success && result.mintAddress) {
        setToast({ message: '🚀 Token launched successfully!', type: 'success' });
        setLaunchResult({
          mint: result.mintAddress,
          signature: result.signature || '',
        });
      } else {
        setToast({ message: `Launch failed: ${result?.error}`, type: 'error' });
      }
    } catch (err) {
      console.error('Launch error:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to launch token',
        type: 'error',
      });
    } finally {
      setLaunching(false);
    }
  };

  const handleCopyCA = () => {
    if (launchResult?.mint) {
      navigator.clipboard.writeText(launchResult.mint);
      setToast({ message: 'CA Copied to clipboard!', type: 'success' });
    }
  };

  const handleDone = () => {
    setLaunchResult(null);
    setMetadata({ name: '', symbol: '', description: '', twitter: '', telegram: '', website: '' });
    setBannerImage(null);
    setPfpImage(null);
    setPrompt('');
    setDevBuyAmount('0.1');
    onSuccess?.();
  };

  if (launchResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 shadow-glow">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white">MISSION ACCOMPLISHED</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Your token is live on Solana</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {/* CA Card */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contract Address</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 truncate">
                {launchResult.mint}
              </code>
              <button
                onClick={handleCopyCA}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl transition-all active:scale-95"
                title="Copy Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton
              onClick={() => window.open(`https://pump.fun/${launchResult.mint}`, '_blank')}
              className="flex items-center justify-center gap-2 py-3"
            >
              <span>💊</span>
              PUMP.FUN
            </PrimaryButton>
            <button
              onClick={() => window.open(`https://solscan.io/token/${launchResult.mint}`, '_blank')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 rounded-xl font-bold text-xs py-3 transition-all flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              SOLSCAN
            </button>
          </div>

          <button
            onClick={handleDone}
            className="w-full py-4 text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.3em] transition-colors"
          >
            ← BACK TO FOUNDRY
          </button>
        </div>

        {/* Toast for success screen */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      {/* Header - Compact */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            TOKEN <span className="text-brand-green text-glow">FOUNDRY</span>
            <span className="bg-brand-green/10 text-brand-green text-[9px] px-1.5 py-0.5 rounded border border-brand-green/20 font-mono tracking-wide">v2.0</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Premium Asset Creation Suite
          </p>
        </div>
      </div>

      {/* Main Layout - High Density */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Form (Col 1-7) */}
        <div className="col-span-7 space-y-4">
          {/* Token Identity Section */}
          <section className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-xs">🎯</span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Identity
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Name"
                  placeholder="Token Name"
                  value={metadata.name || ''}
                  onChange={(e) => handleMetadataChange('name', e.target.value)}
                  maxLength={32}
                />
                <Input
                  label="Symbol"
                  placeholder="$SYM"
                  value={metadata.symbol || ''}
                  onChange={(e) => handleMetadataChange('symbol', e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Briefly describe your token..."
                value={metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>
          </section>

          {/* Creation Card - Banner & Style Grouped */}
          <section className="glass-panel rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs">🎨</span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Visuals
              </h3>
            </div>

            <VisualStyleSelector
              selectedStyle={style}
              onStyleSelect={handleStyleSelect}
            />

            <div className="flex items-center gap-2 px-3 py-2.5 bg-black/40 rounded-lg border border-white/5 hover:border-brand-green/30 transition-colors">
              <input
                type="checkbox"
                id="generatePfp"
                checked={generatePfp}
                onChange={(e) => setGeneratePfp(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-zinc-950 border-zinc-800 rounded focus:ring-emerald-500/50 cursor-pointer"
              />
              <label htmlFor="generatePfp" className="text-[11px] font-bold text-zinc-300 cursor-pointer">
                GENERATE PFP
              </label>
            </div>

            <Textarea
              label="Prompt"
              placeholder="e.g. a cool rocket launching..."
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              rows={2}
            />
            
            <div className="flex gap-2">
              <PrimaryButton
                onClick={handleGenerateImages}
                loading={loading}
                className="flex-1 text-xs py-2.5 premium-button"
                disabled={!prompt.trim()}
              >
                ✨ GENERATE
              </PrimaryButton>

              <label className="px-4 py-2.5 bg-black/40 hover:bg-white/5 rounded-lg text-[10px] font-bold text-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center border border-white/10 hover:border-white/20 hover:text-white active:scale-95 uppercase tracking-wider">
                UPLOAD
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Socials - Compact */}
          <section className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-xs">🔗</span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Socials
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Input
                placeholder="Twitter URL"
                value={metadata.twitter || ''}
                onChange={(e) => handleMetadataChange('twitter', e.target.value)}
              />
              <Input
                placeholder="Telegram URL"
                value={metadata.telegram || ''}
                onChange={(e) => handleMetadataChange('telegram', e.target.value)}
              />
              <Input
                placeholder="Website URL"
                value={metadata.website || ''}
                onChange={(e) => handleMetadataChange('website', e.target.value)}
              />
            </div>
          </section>

          {/* Launch Settings */}
          <section className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-xs">🚀</span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Launch Settings
              </h3>
            </div>

            <div className="space-y-3">
              <Input
                label="Dev Buy Amount (SOL)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.1"
                value={devBuyAmount}
                onChange={(e) => setDevBuyAmount(e.target.value)}
              />
              <p className="text-[9px] text-zinc-500 font-medium px-1">
                The amount of SOL you want to buy instantly on launch.
              </p>
            </div>
          </section>

          {/* Final Action */}
          <PrimaryButton
            onClick={handleLaunch}
            loading={launching}
            disabled={!isFormValid || !bannerImage}
            className="w-full py-4 text-xs font-black tracking-[0.2em] premium-button"
          >
            {launching ? 'INITIATING LAUNCH...' : 'LAUNCH TOKEN'}
          </PrimaryButton>
        </div>

        {/* Right Panel - Preview (Col 8-12) */}
        <div className="col-span-5 sticky top-0">
          <LivePreviewPane
            metadata={metadata}
            style={style}
            imageData={bannerImage}
            pfpData={pfpImage}
            previewStatus={previewStatus}
            validationErrors={validationErrors}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TokenCreationForm;
