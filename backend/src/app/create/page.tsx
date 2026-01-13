"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header, HeaderButton } from "@/components/layout/Header";
import { Button } from "@/components/primitives/Button";
import { Input, Textarea } from "@/components/primitives/Input";
import { Slider } from "@/components/primitives/Slider";
import { Badge } from "@/components/primitives/Badge";
import { ImageDropzone } from "@/components/studio/ImageDropzone";
import { StylePicker, StyleOption } from "@/components/studio/StylePicker";
import { ResultDisplay } from "@/components/studio/ResultDisplay";
import { LaunchConfigurator, LaunchConfig } from "@/components/studio/LaunchConfigurator";
import { SuccessModal } from "@/components/studio/SuccessModal";
import { TweetSniper } from "@/components/studio/TweetSniper";
import { WalletButton } from "@/components/core/WalletButton";
import { WelcomeModal } from "@/components/core/WelcomeModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Clock, 
  Twitter, 
  Image as ImageIcon,
  Sparkles,
  Download,
  RotateCcw,
  Rocket,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  ExternalLink as LinkIcon,
  LayoutGrid,
  Github
} from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { getCreateTokenTransaction } from "@/lib/pumpportal";

type AppState = "idle" | "generating" | "generated" | "launching";
type OutputMode = "banner" | "pfp";
type TokenSource = "existing" | "create" | "tweet";

interface LaunchFormData {
  // Token source
  tokenSource: TokenSource;
  contractAddress: string;
  tweetUrl: string;
  
  // Token details
  tokenName: string;
  ticker: string;
  tagline: string;
  
  // AI options
  creativePrompt: string;
  style: string;
  chaosLevel: number;
  
  // Image
  image: File | null;
  imagePreview: string | null;
}

const STYLES: StyleOption[] = [
  { id: "clean", label: "Clean", description: "Minimal & professional" },
  { id: "chaotic", label: "Chaotic", description: "Wild & dynamic" },
  { id: "meme", label: "Meme", description: "Degen energy" },
  { id: "retro", label: "Retro", description: "80s vibes" },
  { id: "vapor", label: "Vapor", description: "Aesthetic" },
  { id: "edgy", label: "Edgy", description: "Dark & moody" },
];

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [outputMode, setOutputMode] = useState<OutputMode>("banner");
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    seed: number;
    prompt?: string;
    recipeId?: string;
  } | null>(null);
  const [companionResult, setCompanionResult] = useState<{
    imageUrl: string;
    seed: number;
    prompt?: string;
    recipeId?: string;
  } | null>(null);
  
  // Launch Success State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [launchResult, setLaunchResult] = useState<{
    signature: string;
    mintAddress: string;
    tokenName: string;
    ticker: string;
    bannerUrl?: string; // Add bannerUrl
  } | null>(null);

  const [lookingUp, setLookingUp] = useState(false);
  
  const [formData, setFormData] = useState<LaunchFormData>({
    tokenSource: "existing",
    contractAddress: "",
    tokenName: "",
    ticker: "",
    tagline: "",
    creativePrompt: "",
    style: "chaotic",
    chaosLevel: 50,
    image: null,
    imagePreview: null,
    tweetUrl: "",
  });

  // Hooks
  const { connection } = useConnection();
  const wallet = useWallet();
  // We'll use these in handleLaunch, but need to capture them in closure or direct access
  // Renaming to avoid conflict if I destructured above, but I didn't.
  // Actually, I can just use them directly in handleLaunch if I define them here.
  
  // Create a stable object to pass or just use variables
  const useConnectionHooks = { connection }; 


  // Form validation - different requirements based on token source
  const isFormValid = 
    formData.tokenSource === "tweet"
      ? formData.tokenName.trim() !== "" && formData.creativePrompt.trim() !== ""
      : formData.tokenSource === "create" 
        ? formData.tokenName.trim() !== "" && (formData.image !== null || formData.creativePrompt.trim() !== "")
        : formData.tokenName.trim() !== "" && formData.image !== null;

  // CA Lookup function
  const handleCALookup = async () => {
    if (!formData.contractAddress.trim()) return;
    
    setLookingUp(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/token-lookup?address=${formData.contractAddress}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          tokenName: data.data.name,
          ticker: data.data.symbol,
        }));
        
        // If token has an image, try to load it
        if (data.data.image) {
          try {
            const imgResponse = await fetch(data.data.image);
            const blob = await imgResponse.blob();
            const file = new File([blob], 'token.png', { type: blob.type });
            
            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: reader.result as string,
              }));
            };
            reader.readAsDataURL(file);
          } catch {
            console.log('Could not auto-load token image');
          }
        }
      } else {
        setError(data.error || 'Token not found');
      }
    } catch (err) {
      setError('Failed to lookup token');
    } finally {
      setLookingUp(false);
    }
  };

  // Generate function
  const handleGenerate = async () => {
    if (!isFormValid) return;
    
    setState("generating");
    setError(null);
    setGeneratedResult(null);
    setCompanionResult(null);
    
    try {
      const shouldGenerateCompanion = formData.tokenSource === "create" || formData.tokenSource === "tweet";

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: formData.tokenName,
          ticker: formData.ticker,
          tagline: formData.tagline,
          creativePrompt: formData.creativePrompt,
          style: formData.style,
          chaosLevel: formData.chaosLevel,
          imageBase64: formData.imagePreview,
          outputType: outputMode,
          generateCompanion: shouldGenerateCompanion,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.banners?.length > 0) {
        // Find result matching current output mode
        const mainResult = data.banners.find((b: any) => b.outputType === outputMode) || data.banners[0];
        const otherResult = data.banners.find((b: any) => (b.outputType && b.outputType !== outputMode) || b.id !== mainResult.id);

        setGeneratedResult({
          imageUrl: mainResult.imageUrl,
          seed: mainResult.seed,
          prompt: mainResult.prompt,
          recipeId: mainResult.recipeId,
        });

        if (otherResult) {
          setCompanionResult({
            imageUrl: otherResult.imageUrl,
            seed: otherResult.seed,
            prompt: otherResult.prompt,
            recipeId: otherResult.recipeId,
          });
        }
        
        setState("generated");
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setState("idle");
    }
  };

  // Regenerate with same settings
  const handleRegenerate = () => {
    handleGenerate();
  };

  // Reset to start over
  const handleReset = () => {
    setState("idle");
    setGeneratedResult(null);
    setError(null);
  };

  // Transition to launch configuration
  const handleLaunchConfig = () => {
    setState("launching");
  };

  // Final launch handler
  const handleLaunch = async (config: LaunchConfig) => {
    // Determine image to use
    // PRIORITIZE Generated PFP from config if available (this comes from LaunchConfigurator's activePfpUrl)
    // Fallback to formData.imagePreview (uploaded image)
    let imageBase64 = "";

    // If config has a URL (likely from regeneration or passed state), try to use it
    if (config.pfpImageUrl) {
        // If it's a data URL (base64 alias), use it directly
        if (config.pfpImageUrl.startsWith('data:')) {
            imageBase64 = config.pfpImageUrl;
        } 
        // If it's a remote URL (generated image), fetch it
        else if (config.pfpImageUrl.startsWith('http')) {
            try {
                const response = await fetch(config.pfpImageUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                });
                reader.readAsDataURL(blob);
                imageBase64 = await base64Promise;
            } catch (err) {
                console.error("Failed to fetch generated image:", err);
                // Fallback to existing preview if scan failed
                if (formData.imagePreview) imageBase64 = formData.imagePreview;
            }
        }
    } 
    // Fallback: If no URL from config, check formData.imagePreview
    else if (formData.imagePreview) {
        imageBase64 = formData.imagePreview;
    }

    if (!imageBase64) {
        alert("No image found for launch! Please generate or upload one.");
        return;
    }

    // Connect to Solana
    const { publicKey, sendTransaction } = wallet;
    const { connection } = useConnectionHooks;

    if (!publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      // Launch logic starts here
      // Note: LaunchConfigurator handles the loading state for the button

      
      const mintKeypair = Keypair.generate();
      
      // TODO: Get API Key from env
      const apiKey = process.env.NEXT_PUBLIC_PUMPPORTAL_API_KEY || "demo-api-key"; 

      const result = await getCreateTokenTransaction(
        {
          metadata: {
            name: config.name,
            symbol: config.symbol,
            description: config.description,
            twitter: config.twitter,
            telegram: config.telegram,
            website: config.website,
            imageBase64: imageBase64 || "", // Must have image
          },
          devBuyAmount: config.devBuyAmount,
          slippage: 10, 
          priorityFee: 0.0005,
        },
        mintKeypair,
        publicKey.toBase58(),
        apiKey
      );

      if (result.error || !result.transaction) {
        throw new Error(result.error || "Failed to create transaction");
      }

      const txBuffer = bs58.decode(result.transaction);
      const transaction = VersionedTransaction.deserialize(txBuffer);

      // Sign with mint keypair
      transaction.sign([mintKeypair]);

      // Send transaction (user's wallet will sign)
      const signature = await sendTransaction(transaction, connection);
      
      console.log("Transaction sent:", signature);
      
      // Notify success via Modal
      setLaunchResult({
        signature,
        mintAddress: mintKeypair.publicKey.toBase58(),
        tokenName: config.name,
        ticker: config.symbol,
        bannerUrl: config.bannerImageUrl,
      });
      setShowSuccessModal(true);
      setState("idle"); // Reset state or keep waiting? "idle" might clear the form. 
      // Maybe keep "launching" but show modal overlay? 
      // The modal is global, but "launching" state shows the configurator.
      // Let's reset to "generated" or "idle"? 
      // User might want to see the result. "idle" is fine as the modal overlays everything.
      
    } catch (err) {
      console.error("Launch failed:", err);
      setError("Failed to launch token: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Header with actions
  const headerContent = (
    <Header
      actions={
        <>
          <div className="flex items-center gap-1 bg-gray-950/50 p-1 rounded-xl border border-white/5 mr-2">
            <HeaderButton
              icon={<LinkIcon className="w-4 h-4" />}
              label="Docs"
              href="/docs"
            />
            <HeaderButton
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Gallery"
              href="/gallery"
            />
            <HeaderButton
              icon={<Clock className="w-4 h-4" />}
              label="History"
              onClick={() => {}}
            />
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

          <div className="flex items-center gap-1">
            <HeaderButton
              icon={<Twitter className="w-4 h-4" />}
              href="https://x.com/dexdripfun"
            />
            <HeaderButton
              icon={<Github className="w-4 h-4" />}
              href="https://github.com/nullxnothing/dexdrip"
            />
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
          
          <WalletButton />
        </>
      }
    />
  );

  // Sidebar content
  const sidebarContent = (
    <div className="p-6 space-y-6">
      {/* Output Mode Toggle */}
      <section>
        <h2 className="text-label mb-3">Output Type</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setOutputMode("banner")}
            className={`
              flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150
              ${outputMode === "banner"
                ? "bg-accent text-black"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
              }
            `}
          >
            Banner
            <span className="block text-xs opacity-70 mt-0.5">1500×500</span>
          </button>
          <button
            onClick={() => setOutputMode("pfp")}
            className={`
              flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150
              ${outputMode === "pfp"
                ? "bg-accent text-black"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
              }
            `}
          >
            PFP
            <span className="block text-xs opacity-70 mt-0.5">1000×1000</span>
          </button>
        </div>
      </section>

      {/* Token Source Toggle */}
      <section>
        <h2 className="text-label mb-3">Token Source</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFormData(prev => ({ ...prev, tokenSource: "existing" }))}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2
              ${formData.tokenSource === "existing"
                ? "bg-accent text-black"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
              }
            `}
          >
            <Search className="w-4 h-4" />
            Existing Token
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, tokenSource: "create" }))}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2
              ${formData.tokenSource === "create"
                ? "bg-accent text-black"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
              }
            `}
          >
            <Rocket className="w-4 h-4" />
            Create New
          </button>
        </div>
        
        {/* Tweet Sniper Tab Button */}
        <button
          onClick={() => setFormData(prev => ({ ...prev, tokenSource: "tweet" }))}
          className={`
            w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 mb-4
            ${formData.tokenSource === "tweet"
              ? "bg-purple-900/20 border-purple-500/50 text-purple-200"
              : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-accent/50"
            }
          `}
        >
          <Twitter className="w-4 h-4" />
          🎯 Tweet Sniper
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 ml-auto">PREMIUM</span>
        </button>



        {/* Existing Token: CA Input */}
        {formData.tokenSource === "existing" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Contract Address"
                  placeholder="Enter CA to fetch token data..."
                  value={formData.contractAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleCALookup}
                disabled={!formData.contractAddress.trim() || lookingUp}
                className="mt-7"
                loading={lookingUp}
              >
                {lookingUp ? "Looking up..." : "Lookup"}
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-error">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
            <p className="text-xs text-gray-600">
              We'll auto-fetch the token name, symbol, and image
            </p>
          </div>
        )}

        {/* Create New: PumpPortal Info */}
        {formData.tokenSource === "create" && (
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-start gap-3">
              <Rocket className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">Launch with PumpPortal</p>
                <p className="text-xs text-gray-500 mt-1">
                  Create your banner/PFP from scratch, then auto-launch your token on pump.fun
                </p>

              </div>
            </div>
          </div>
        )}

        {/* Tweet Sniper Info */}
        {formData.tokenSource === "tweet" && (
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">AI Tweet Sniper</p>
                <p className="text-xs text-gray-500 mt-1">
                  Paste a tweet URL to instantly analyze its vibe and generate a matching meme coin banner + PFP. Perfect for rapid news trading.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tweet Sniper Content */}
        {formData.tokenSource === "tweet" && (
          <TweetSniper
            onSuggestionApply={(suggestion) => {
              setFormData(prev => ({
                ...prev,
                tokenName: suggestion.tokenName,
                ticker: suggestion.ticker,
                tagline: suggestion.tagline,
                creativePrompt: suggestion.creativePrompt,
              }));
            }}
          />
        )}
      </section>

      <hr className="border-gray-800" />

      {/* Token Image - hide for tweet sniper mode as it uses AI-generated content */}
      {formData.tokenSource !== "tweet" && (
      <section>
        <h2 className="text-label mb-4">
          {formData.tokenSource === "existing" ? "Token Image (optional override)" : "Token Image"}
        </h2>
        <ImageDropzone
          value={formData.imagePreview}
          onChange={(file, preview) => setFormData(prev => ({
            ...prev,
            image: file,
            imagePreview: preview,
          }))}
        />
      </section>
      )}

      {/* Step 2: Token Details */}
      <section>
        <h2 className="text-label mb-4">2. Token Details</h2>
        
        <div className="space-y-4">
          <Input
            label="Token Name"
            placeholder="e.g. Pepe"
            value={formData.tokenName}
            onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
          />
          
          <Input
            label="Ticker"
            placeholder="e.g. $PEPE"
            value={formData.ticker}
            onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
          />
          
          <Textarea
            label="Tagline (optional)"
            placeholder="A catchy phrase for your token..."
            value={formData.tagline}
            onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
            rows={2}
          />
        </div>
      </section>

      {/* Style Selection */}
      <section>
        <h2 className="text-label mb-4">Style</h2>
        <StylePicker
          options={STYLES}
          value={formData.style}
          onChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
        />
      </section>

      {/* Creative Prompt */}
      <section>
        <Textarea
          label="AI Description (optional)"
          placeholder="Describe what you want... e.g. 'Space theme with planets and stars, purple/blue colors, epic feel'"
          value={formData.creativePrompt}
          onChange={(e) => setFormData(prev => ({ ...prev, creativePrompt: e.target.value }))}
          rows={3}
          hint="Highly recommended. If left blank, images will be pretty generic."
        />
      </section>

      {/* Creativity Slider */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Creativity</span>
          <span className="text-sm font-mono text-accent">{formData.chaosLevel}%</span>
        </div>
        <Slider
          value={formData.chaosLevel}
          onChange={(value) => setFormData(prev => ({ ...prev, chaosLevel: value }))}
          min={0}
          max={100}
          showValue={false}
        />
        <p className="text-xs text-gray-600 mt-2">
          Higher = more unpredictable, creative results
        </p>
      </section>

      {/* Generate Button */}
      <div className="pt-4 pb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || state === "generating"}
          onClick={handleGenerate}
          icon={formData.tokenSource === "create" ? <Rocket className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
        >
          {state === "generating" 
            ? "Generating..." 
            : formData.tokenSource === "create"
              ? `Generate & Launch ${outputMode === "pfp" ? "PFP" : "Banner"}`
              : `Generate ${outputMode === "pfp" ? "PFP" : "Banner"}`
          }
        </Button>
        
        {!isFormValid && (
          <p className="text-xs text-gray-500 text-center mt-3">
            {formData.tokenSource === "create"
              ? "Enter a token name and provide an image or description"
              : "Upload an image and enter a token name to continue"
            }
          </p>
        )}
      </div>
    </div>
  );

  // Main content area
  const mainContent = (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-900 border border-border flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Your {outputMode === "pfp" ? "PFP" : "banner"} preview
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Fill out the form on the left to generate a stunning {outputMode === "pfp" ? "profile picture" : "DexScreener banner"}
          </p>
          
          {/* Dimensions indicator - dynamic based on output mode */}
          <div 
            className={`mt-8 mx-auto border border-dashed border-gray-800 rounded-lg flex items-center justify-center ${
              outputMode === "pfp" 
                ? "w-48 h-48" 
                : "max-w-lg aspect-[3/1]"
            }`}
          >
            <span className="text-xs text-gray-600 font-mono">
              {outputMode === "pfp" ? "1000 × 1000" : "1500 × 500"}
            </span>
          </div>
        </motion.div>
      )}

      {state === "generating" && (
        <motion.div
          key="generating"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-accent border-t-transparent"
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Generating your {outputMode === "pfp" ? "PFP" : "banner"}...
          </h2>
          <p className="text-gray-500 text-sm">
            This usually takes 5-10 seconds
          </p>
        </motion.div>
      )}

      {state === "generated" && generatedResult && (
        <motion.div
          key="generated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full flex justify-center"
        >
          <ResultDisplay
            result={generatedResult}
            tokenName={formData.tokenName}
            ticker={formData.ticker}
            style={formData.style}
            outputMode={outputMode}
            onRegenerate={handleRegenerate}
            onReset={handleReset}
            actionButton={
              (formData.tokenSource === "create" || formData.tokenSource === "tweet") && (
                <Button
                  variant="primary"
                  onClick={handleLaunchConfig}
                  icon={<Rocket className="w-4 h-4" />}
                >
                  Configure Launch
                </Button>
              )
            }
          />
        </motion.div>
      )}

      {state === "launching" && (
        <motion.div
          key="launching"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full"
        >
          <LaunchConfigurator
            tokenName={formData.tokenName}
            ticker={formData.ticker}
            description={formData.tagline}
            pfpImageUrl={
              outputMode === "pfp" 
                ? generatedResult?.imageUrl 
                : companionResult?.imageUrl
            }
            bannerImageUrl={
              outputMode === "banner" 
                ? generatedResult?.imageUrl 
                : companionResult?.imageUrl
            }
            twitterUrl={formData.tweetUrl}
            creativePrompt={formData.creativePrompt}

            style={formData.style}
            recipeId={generatedResult?.recipeId}
            imageBase64={formData.imagePreview || undefined}
            onLaunch={handleLaunch}
            onBack={() => setState("generated")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AppShell
      header={headerContent}
      sidebar={sidebarContent}
      main={
        <>
          <WelcomeModal />
          {mainContent}
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
                setShowSuccessModal(false);
                setLaunchResult(null);
                handleReset();
            }}
            tokenName={launchResult?.tokenName || ""}
            ticker={launchResult?.ticker || ""}
            signature={launchResult?.signature || ""}
            mintAddress={launchResult?.mintAddress || ""}
            bannerUrl={launchResult?.bannerUrl}
          />
        </>
      }
    />
  );
}
