import React, { useState } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Slider from './ui/Slider';
import PrimaryButton from './ui/PrimaryButton';
import Toast from './ui/Toast';
import { apiClient } from '../../lib/api-client';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import type { TokenMetadata, WalletState } from '../../types';

// Match quickbanner's style recipes
const BANNER_STYLES = [
  { value: 'clean', label: '✨ Clean' },
  { value: 'chaotic', label: '💥 Chaotic' },
  { value: 'meme', label: '🐸 Meme' },
  { value: 'retro', label: '🌆 Retro' },
  { value: 'vaporwave', label: '🌴 Vaporwave' },
  { value: 'edgy', label: '⚔️ Edgy' },
];

const IMAGE_TYPES = [
  { value: 'pfp', label: 'Profile Picture (PFP)' },
  { value: 'banner', label: 'Banner' },
];

const BannerGenerator: React.FC = () => {
  const [step, setStep] = useState<'type' | 'pfp' | 'banner' | 'metadata'>('type');
  const [imageType, setImageType] = useState<'pfp' | 'banner'>('pfp');
  const [skipImages, setSkipImages] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('clean');
  const [chaosLevel, setChaosLevel] = useState(50);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Partial<TokenMetadata>>({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
  });
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [tagline, setTagline] = useState('');
  const [generatedPfp, setGeneratedPfp] = useState<string | null>(null);
  const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);
  const [devBuyAmount, setDevBuyAmount] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const handleGenerate = async (type: 'pfp' | 'banner') => {
    // Validate inputs
    if (!tokenName.trim() && type === 'pfp') {
      setError('Please enter a token name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.generateBanner({
        tokenName: tokenName || 'Untitled Token',
        ticker: ticker,
        tagline: tagline,
        creativePrompt: prompt,
        style: style,
        chaosLevel: chaosLevel,
        imageBase64: referenceImage || undefined,
        outputType: type,
        variantCount: 1,
      });

      if (type === 'pfp') {
        setGeneratedPfp(result.imageBase64);
        setToast({ message: 'PFP generated successfully!', type: 'success' });
        // Auto-advance to banner generation
        setStep('banner');
        setPrompt(''); // Clear prompt for banner
      } else {
        setGeneratedBanner(result.imageBase64);
        setMetadata((prev) => ({ ...prev, imageBase64: result.imageBase64 }));
        setToast({ message: 'Banner generated successfully!', type: 'success' });
        setStep('metadata');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'pfp' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'pfp') {
        setGeneratedPfp(base64);
        setToast({ message: 'PFP uploaded!', type: 'success' });
      } else {
        setGeneratedBanner(base64);
        setMetadata((prev) => ({ ...prev, imageBase64: base64 }));
        setToast({ message: 'Banner uploaded!', type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setReferenceImage(base64);
      setToast({ message: 'Reference image uploaded!', type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleSkipImages = () => {
    setSkipImages(true);
    setStep('metadata');
    setToast({ message: 'Skipping images - you can add them later', type: 'success' });
  };

  const handleMetadataChange = (field: keyof TokenMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const validateMetadata = (): string | null => {
    if (!metadata.name?.trim()) return 'Token name is required';
    if (metadata.name.length > 32) return 'Token name must be 32 characters or less';
    if (!metadata.symbol?.trim()) return 'Token symbol is required';
    if (metadata.symbol.length > 10) return 'Symbol must be 10 characters or less';
    if (!metadata.description?.trim()) return 'Description is required';
    if (metadata.description.length > 500) return 'Description must be 500 characters or less';
    if (!metadata.imageBase64) return 'Please generate a banner first';
    return null;
  };

  const handleLaunch = async () => {
    const validationError = validateMetadata();
    if (validationError) {
      setToast({ message: validationError, type: 'error' });
      return;
    }

    // Check wallet connection
    const wallet = await storage.get<WalletState>(STORAGE_KEYS.WALLET);
    if (!wallet?.connected || !wallet.address) {
      setToast({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    if (wallet.balance < devBuyAmount + 0.01) {
      setToast({ message: 'Insufficient SOL balance', type: 'error' });
      return;
    }

    setLaunching(true);
    try {
      const { pumpPortalClient } = await import('../../lib/pumpportal');
      const { walletFactory } = await import('../../lib/wallet');

      // Prepare create token params
      const createParams = {
        metadata: metadata as TokenMetadata,
        devBuyAmount,
        slippage: 10,
        priorityFee: 0.0005,
      };

      let result;

      // Check if using embedded wallet or external
      if (wallet.type === 'embedded') {
        // For embedded wallet, we can use API key mode (if available)
        // For now, we'll use the wallet signing method
        const embeddedWallet = walletFactory.createEmbedded();
        
        // Note: User needs to unlock wallet first
        // This is a simplified version - in production, you'd have a password prompt
        const password = window.prompt('Enter wallet password to sign transaction:');
        if (!password) {
          setToast({ message: 'Transaction cancelled', type: 'error' });
          return;
        }

        try {
          await embeddedWallet.load(password);
          const keypair = embeddedWallet.getKeypair();
          
          // Use wallet signing method
          result = await pumpPortalClient.createTokenWithWallet(
            createParams,
            wallet.address,
            async (tx) => {
              tx.sign([keypair]);
              return tx;
            }
          );
        } catch (error) {
          setToast({ message: 'Failed to unlock wallet or sign transaction', type: 'error' });
          return;
        }
      } else if (wallet.type === 'external') {
        // For external wallet (Phantom/Solflare)
        const externalWallet = walletFactory.createExternal();
        const provider = externalWallet.getProvider();

        result = await pumpPortalClient.createTokenWithWallet(
          createParams,
          wallet.address,
          async (tx) => {
            // Request signature from external wallet
            const signedTx = await provider.signTransaction(tx);
            return signedTx;
          }
        );
      } else {
        setToast({ message: 'Invalid wallet type', type: 'error' });
        return;
      }

      if (result.success) {
        setToast({
          message: `Token launched successfully! 🎉`,
          type: 'success',
        });

        // Log details
        console.log('Token launched:', {
          signature: result.signature,
          mintAddress: result.mintAddress,
          solscan: `https://solscan.io/tx/${result.signature}`,
          pumpfun: `https://pump.fun/${result.mintAddress}`,
        });

        // Reset form
        setPrompt('');
        setGeneratedImage(null);
        setMetadata({
          name: '',
          symbol: '',
          description: '',
          twitter: '',
          telegram: '',
          website: '',
        });
      } else {
        setToast({
          message: `Launch failed: ${result.error}`,
          type: 'error',
        });
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

  const remainingChars = {
    name: 32 - (metadata.name?.length || 0),
    symbol: 10 - (metadata.symbol?.length || 0),
    description: 500 - (metadata.description?.length || 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Token</h2>
        <p className="text-text-secondary">
          {step === 'type' && 'Choose how to create your token'}
          {step === 'pfp' && 'Step 1: Create profile picture'}
          {step === 'banner' && 'Step 2: Create banner (optional)'}
          {step === 'metadata' && 'Step 3: Token details'}
        </p>
      </div>

      {/* Step Progress */}
      {step !== 'type' && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`px-3 py-1 rounded-md ${step === 'pfp' || generatedPfp ? 'bg-success/20 text-success' : 'bg-background-tertiary text-text-muted'}`}>
            {generatedPfp ? '✓' : '1'} PFP
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`px-3 py-1 rounded-md ${step === 'banner' || generatedBanner ? 'bg-success/20 text-success' : 'bg-background-tertiary text-text-muted'}`}>
            {generatedBanner ? '✓' : '2'} Banner
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`px-3 py-1 rounded-md ${step === 'metadata' ? 'bg-accent-green text-black' : 'bg-background-tertiary text-text-muted'}`}>
            3 Details
          </div>
        </div>
      )}

      {/* Step 0: Choose Type */}
      {step === 'type' && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-6">How do you want to create your token?</h3>
          </div>

          <button
            onClick={() => setStep('pfp')}
            className="w-full p-6 bg-background-secondary hover:bg-background-tertiary border-2 border-border hover:border-accent-green rounded-lg text-left transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎨</div>
              <div>
                <div className="font-bold text-lg mb-1">Generate with AI</div>
                <div className="text-sm text-text-secondary">
                  Create PFP and banner using AI image generation
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleSkipImages}
            className="w-full p-6 bg-background-secondary hover:bg-background-tertiary border-2 border-border hover:border-accent-green rounded-lg text-left transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚡</div>
              <div>
                <div className="font-bold text-lg mb-1">Quick Launch</div>
                <div className="text-sm text-text-secondary">
                  Skip images and launch immediately (add images later)
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setStep('pfp')}
            className="w-full p-6 bg-background-secondary hover:bg-background-tertiary border-2 border-border hover:border-accent-green rounded-lg text-left transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📤</div>
              <div>
                <div className="font-bold text-lg mb-1">Upload Your Own</div>
                <div className="text-sm text-text-secondary">
                  Upload custom PFP and banner images
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Step 1: PFP Generation */}
      {step === 'pfp' && (
        <div className="space-y-4">
          {generatedPfp ? (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Profile Picture (PFP)
              </label>
              <div className="relative">
                <img
                  src={generatedPfp}
                  alt="Generated PFP"
                  className="w-full aspect-square object-cover rounded-lg border border-success"
                />
                <div className="absolute top-2 right-2 bg-success text-black px-2 py-1 rounded-md text-xs font-bold">
                  ✓ Ready
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <PrimaryButton onClick={() => setStep('banner')} className="flex-1">
                  Continue to Banner →
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => { setGeneratedPfp(null); setPrompt(''); }}
                  variant="secondary"
                  className="px-6"
                >
                  ↻
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <>
              {/* Token Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Token Name"
                  placeholder="My Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  maxLength={32}
                />
                <Input
                  label="Symbol (Ticker)"
                  placeholder="MTK"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>

              <Input
                label="Tagline (Optional)"
                placeholder="To the moon! 🚀"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={100}
              />

              {/* Reference Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reference Image (Optional)
                </label>
                <p className="text-xs text-text-muted mb-2">
                  Upload a mascot/character image for AI to use as reference
                </p>
                {referenceImage ? (
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent-green hover:bg-background-secondary transition-all">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📤</div>
                      <span className="text-sm text-text-secondary">Upload reference image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Textarea
                label="Creative Prompt"
                placeholder="Describe your vision... (e.g., 'Cool pepe with sunglasses on a rocket')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                error={error || undefined}
                rows={3}
              />

              <Select
                label="Art Style"
                options={BANNER_STYLES}
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />

              {/* Chaos Level Slider */}
              <div className="bg-background-secondary border border-border rounded-lg p-4">
                <Slider
                  label="Chaos Level"
                  value={chaosLevel}
                  onChange={setChaosLevel}
                  min={0}
                  max={100}
                  step={1}
                  unit=""
                />
                <p className="text-xs text-text-muted mt-2">
                  {chaosLevel < 30 ? '🧘 Calm & Clean' : chaosLevel < 70 ? '⚡ Balanced Energy' : '💥 Maximum Chaos!'}
                </p>
              </div>

              <PrimaryButton onClick={() => handleGenerate('pfp')} loading={loading} className="w-full">
                ✨ Generate PFP
              </PrimaryButton>

              <div className="text-center">
                <label className="text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                  or{' '}
                  <span className="text-accent-green underline">upload your own</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'pfp')}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Banner Generation */}
      {step === 'banner' && (
        <div className="space-y-4">
          {generatedPfp && (
            <div className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
              <img src={generatedPfp} alt="PFP" className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <span className="text-sm font-medium">{tokenName || 'Token'}</span>
                <span className="text-sm text-text-secondary ml-2">PFP created ✓</span>
              </div>
            </div>
          )}

          {generatedBanner ? (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Banner Image
              </label>
              <div className="relative">
                <img
                  src={generatedBanner}
                  alt="Generated banner"
                  className="w-full rounded-lg border border-success"
                />
                <div className="absolute top-2 right-2 bg-success text-black px-2 py-1 rounded-md text-xs font-bold">
                  ✓ Ready
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <PrimaryButton onClick={() => {
                  // Auto-populate metadata fields
                  setMetadata(prev => ({
                    ...prev,
                    name: tokenName,
                    symbol: ticker,
                    description: tagline || '',
                  }));
                  setStep('metadata');
                }} className="flex-1">
                  Continue to Details →
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => { setGeneratedBanner(null); setPrompt(''); }}
                  variant="secondary"
                  className="px-6"
                >
                  ↻
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <>
              <Textarea
                label="Banner Prompt"
                placeholder="Describe the banner scene... (e.g., 'Flying through space with moon background')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                error={error || undefined}
                rows={3}
              />

              <Select
                label="Banner Style"
                options={BANNER_STYLES}
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />

              {/* Chaos Level Slider */}
              <div className="bg-background-secondary border border-border rounded-lg p-4">
                <Slider
                  label="Chaos Level"
                  value={chaosLevel}
                  onChange={setChaosLevel}
                  min={0}
                  max={100}
                  step={1}
                  unit=""
                />
                <p className="text-xs text-text-muted mt-2">
                  {chaosLevel < 30 ? '🧘 Calm & Clean' : chaosLevel < 70 ? '⚡ Balanced Energy' : '💥 Maximum Chaos!'}
                </p>
              </div>

              <PrimaryButton onClick={() => handleGenerate('banner')} loading={loading} className="w-full">
                ✨ Generate Banner
              </PrimaryButton>

              <div className="flex gap-2">
                <label className="flex-1 text-center cursor-pointer">
                  <span className="text-sm text-text-secondary hover:text-text-primary">
                    <span className="text-accent-green underline">Upload banner</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    // Auto-populate metadata fields
                    setMetadata(prev => ({
                      ...prev,
                      name: tokenName,
                      symbol: ticker,
                      description: tagline || '',
                    }));
                    setStep('metadata');
                    setSkipImages(true);
                  }}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Skip banner →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Token Metadata */}
      {step === 'metadata' && (generatedBanner || skipImages) && (
        <div className="space-y-6 animate-fadeIn">
          {/* Show PFP and Banner */}
          <div className="grid grid-cols-2 gap-4">
            {generatedPfp && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Profile Picture
                </label>
                <img
                  src={generatedPfp}
                  alt="Token PFP"
                  className="w-full aspect-square object-cover rounded-lg border border-success"
                />
              </div>
            )}
            {generatedBanner && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Banner
                </label>
                <img
                  src={generatedBanner}
                  alt="Token banner"
                  className="w-full aspect-square object-cover rounded-lg border border-success"
                />
              </div>
            )}
            {skipImages && !generatedPfp && !generatedBanner && (
              <div className="col-span-2 p-6 bg-background-secondary border border-border rounded-lg text-center">
                <p className="text-text-muted text-sm">No images - launching without visuals</p>
              </div>
            )}
          </div>

          {/* Token Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Token Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Token Name"
                  placeholder="My Awesome Coin"
                  value={metadata.name}
                  onChange={(e) => handleMetadataChange('name', e.target.value)}
                  maxLength={32}
                  success={!!metadata.name && metadata.name.length <= 32}
                />
                <div className="text-xs text-text-muted mt-1">{remainingChars.name} chars left</div>
              </div>

              <div>
                <Input
                  label="Symbol"
                  placeholder="MAC"
                  value={metadata.symbol}
                  onChange={(e) => handleMetadataChange('symbol', e.target.value.toUpperCase())}
                  maxLength={10}
                  success={!!metadata.symbol && metadata.symbol.length <= 10}
                />
                <div className="text-xs text-text-muted mt-1">{remainingChars.symbol} chars left</div>
              </div>
            </div>

            <div>
              <Textarea
                label="Description"
                placeholder="The best meme coin ever created..."
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                maxLength={500}
                rows={4}
                success={!!metadata.description && metadata.description.length <= 500}
              />
              <div className="text-xs text-text-muted mt-1">{remainingChars.description} chars left</div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-secondary">Social Links (Optional)</h4>
              <Input
                placeholder="🐦 https://twitter.com/..."
                value={metadata.twitter}
                onChange={(e) => handleMetadataChange('twitter', e.target.value)}
              />
              <Input
                placeholder="💬 https://t.me/..."
                value={metadata.telegram}
                onChange={(e) => handleMetadataChange('telegram', e.target.value)}
              />
              <Input
                placeholder="🌐 https://..."
                value={metadata.website}
                onChange={(e) => handleMetadataChange('website', e.target.value)}
              />
            </div>

            {/* Dev Buy Amount */}
            <div className="bg-background-secondary border border-border rounded-lg p-4">
              <Slider
                label="Dev Buy Amount"
                value={devBuyAmount}
                onChange={setDevBuyAmount}
                min={0.01}
                max={5}
                step={0.01}
                unit="SOL"
              />
              <p className="text-xs text-text-muted mt-2">
                Initial purchase amount for your token launch
              </p>
            </div>

            <PrimaryButton
              onClick={handleLaunch}
              loading={launching}
              className="w-full"
              disabled={!metadata.name || !metadata.symbol || !metadata.description}
            >
              🚀 Launch Token ({devBuyAmount} SOL)
            </PrimaryButton>
          </div>
        </div>
      )}

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

export default BannerGenerator;
