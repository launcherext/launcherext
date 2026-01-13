# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Launch Ext is a Chrome extension (Manifest V3) that enables users to create AI-powered memecoin banners and launch tokens on pump.fun directly from their browser. Built with React, TypeScript, Tailwind CSS, and Solana Web3.js.

## Build & Development Commands

### Development
```bash
npm run dev          # Watch mode with webpack hot reloading
npm run build        # Production build to dist/
npm run type-check   # TypeScript type checking
```

### Testing the Extension
1. Build: `npm run build`
2. Load in Chrome: `chrome://extensions/` → Enable Developer Mode → Load unpacked → Select `dist/` folder
3. After code changes, rebuild and reload extension in Chrome

### Packaging for Release
```bash
npm run build
cd dist
# Windows PowerShell:
Compress-Archive -Path * -DestinationPath ../launch-ext-v1.0.0.zip
# macOS/Linux:
zip -r ../launch-ext-v1.0.0.zip .
```

## Architecture

### Extension Structure

**Popup UI (`extension/popup/`)**
- React app rendered in extension popup
- Entry: `index.tsx` → `App.tsx` → Component tabs
- Tab-based navigation: Create, Dashboard, History, Wallet
- All UI components use pump.fun-inspired design system (dark theme, green accents #00ff88)

**Background Service Worker (`extension/background/service-worker.ts`)**
- Handles persistent logic and storage access
- Message passing between popup and background contexts
- Sets default settings on installation

**Content Script (`extension/content/wallet-bridge.ts`)**
- Bridges wallet providers (Phantom/Solflare) from webpage to extension
- Required because extension popups can't access `window.phantom`/`window.solana` directly
- Injected into active tabs when connecting external wallets

**Core Libraries (`extension/lib/`)**
- `wallet.ts` - Dual wallet system (embedded & external)
  - EmbeddedWallet: AES-GCM encrypted keypair storage
  - ExternalWallet: Phantom/Solflare connection via content script bridge
- `pumpportal.ts` - PumpPortal API integration for token creation
  - Two creation methods: API key (Lightning) and local wallet signing
- `api-client.ts` - Backend API communication (banner generation, IPFS proxy, launch tracking)
- `stats.ts` - Token statistics fetching
- `storage.ts` - Chrome storage wrapper utilities
- `theme.ts` - Design system tokens

### Wallet Architecture

**Dual wallet system:**
1. **Embedded Wallet** - Keypair generated/imported, encrypted with AES-GCM, stored in Chrome local storage
2. **External Wallet** - Phantom/Solflare connected via content script injection

**Security:**
- Private keys never leave the extension
- Embedded wallets use PBKDF2 (100k iterations) + AES-GCM-256
- External wallets sign transactions in their own context

### Token Launch Flow

1. User generates AI banner via backend API (`/api/generate`)
2. User fills metadata (name, symbol, description, socials)
3. Backend proxies IPFS upload to avoid CORS (`/api/launch/ipfs`)
4. PumpPortal transaction created with metadata URI
5. Transaction signed with wallet (embedded keypair or external wallet)
6. Launch saved to local storage + backend database
7. Dashboard displays launches with real-time stats

### Component Organization

**UI Components (`extension/popup/components/ui/`)**
- Design system components: PrimaryButton, Input, Textarea, Select, Slider, Modal, Toast
- Specialized: TokenCard, LiveBadge, ProgressBar, StatBadge, TabNavigation
- All use Tailwind with theme tokens from `lib/theme.ts`

**Feature Components (`extension/popup/components/`)**
- `BannerGenerator.tsx` - AI banner generation UI
- `WalletManager.tsx` - Wallet connection/management
- `TokenCreationForm.tsx` - Token metadata form
- `LaunchDashboard.tsx` - Grid of launched tokens with stats
- `LaunchHistory.tsx` - Chronological launch list

## Backend Integration

**Expected Backend URLs (configurable in `extension/lib/api-client.ts`):**
- Default: `http://localhost:3000` (development)
- Production: Update `DEFAULT_BACKEND_URL` before building

**API Endpoints:**
- `POST /api/generate` - AI banner generation
- `POST /api/launch/ipfs` - IPFS metadata upload proxy
- `POST /api/launches` - Save launch data
- `GET /api/launches?wallet=<address>` - Fetch launches
- `GET /api/token-stats?mint=<mint>` - Token statistics

**Backend codebase location:** `../quickbanner` (Next.js app)

## Key Technical Details

### Webpack Configuration
- Entry points: `popup`, `background`, `content/wallet-bridge`
- CSS processing: style-loader → css-loader → postcss-loader (Tailwind)
- TypeScript compilation: ts-loader with transpileOnly
- Output: `dist/` directory (copied manifest.json and public/ folder)

### Chrome Extension Permissions
- `storage` - Chrome local storage for wallet/settings
- `tabs`, `activeTab` - Content script injection for wallet bridge
- `scripting` - Dynamic content script injection
- `host_permissions: ["https://*/*", "http://*/*"]` - API calls

### PumpPortal Integration
**Two transaction methods:**
1. **Lightning API** (`/api/trade?api-key=...`) - Backend signs with API key
2. **Local Signing** (`/api/trade-local`) - Returns transaction bytes, user signs locally

**Token creation params:**
- `action: "create"`
- `tokenMetadata: { name, symbol, uri }`
- `mint` - Base58 encoded mint keypair secret (Lightning) or public key (Local)
- `denominatedInSol: "true"`
- `amount` - Dev buy amount in SOL
- `slippage` - Default 10
- `priorityFee` - Default 0.0005 SOL
- `pool: "pump"`

### Storage Keys (Chrome Local Storage)
Defined in `extension/lib/storage.ts`:
- `wallet` - Current wallet state (address, balance, type)
- `encrypted_key` - AES-GCM encrypted embedded wallet
- `launches` - Array of launch data
- `settings` - User preferences (RPC URL, defaults)

## Common Patterns

### Adding a New Tab
1. Add component in `extension/popup/components/`
2. Register in `App.tsx` tabs array
3. Update TabNavigation rendering

### Adding a UI Component
1. Create in `extension/popup/components/ui/`
2. Use Tailwind classes with theme tokens from `lib/theme.ts`
3. Follow pump.fun design (dark bg, green accents, hover effects)

### Storage Operations
```typescript
import { storage, STORAGE_KEYS } from '../lib/storage';

// Save
await storage.set(STORAGE_KEYS.WALLET, walletState);

// Load
const wallet = await storage.get<WalletState>(STORAGE_KEYS.WALLET);

// Remove
await storage.remove(STORAGE_KEYS.WALLET);
```

### Type Definitions
All types in `extension/types/index.ts`:
- `TokenMetadata`, `LaunchData`, `TokenStats`
- `WalletState`, `Settings`
- `CreateTokenParams`, `CreateTokenResult`
- Background message types

## Design System

**Colors:**
- Background: `#0a0a0a` (deep black)
- Card background: `#1a1a1a`
- Accent green: `#00ff88`
- Border: `#2a2a2a`

**Typography:**
- Font: System font stack
- Sizes: text-xs to text-2xl

**Component patterns:**
- Cards have `bg-[#1a1a1a]` with border `border-[#2a2a2a]`
- Primary CTAs use green background `bg-[#00ff88]` with black text
- Hover states: `hover:brightness-110`
- Live badges pulse with green animation

## Environment & Configuration

**Frontend (Extension):**
- Backend URL: `extension/lib/api-client.ts` → `DEFAULT_BACKEND_URL`
- RPC URL: Stored in Chrome storage, default `https://api.mainnet-beta.solana.com`

**Backend (Not in this repo):**
- `PUMPPORTAL_API_KEY` - PumpPortal API key
- `SOLANA_RPC_URL` - Solana RPC endpoint
- `POSTGRES_*` - Database connection
- `AI_PROVIDER_KEY` - AI banner generation

## Important Notes

- Extension uses Manifest V3 (service workers, not background pages)
- Content scripts run in webpage context to access wallet providers
- IPFS uploads proxied through backend to avoid CORS
- Local storage used for quick access, backend database for persistence
- Token stats currently use placeholder data (needs pump.fun API integration)
- Embedded wallet unlock uses browser prompt (should be replaced with modal)

## Security Considerations

- Never log or transmit private keys
- Embedded wallets encrypted with user password
- External wallets sign in their own isolated context
- API calls use HTTPS in production
- Rate limiting implemented on backend
- Input validation on all metadata fields

## Related Documentation

- `README.md` - Project overview and setup
- `QUICKSTART.md` - Getting started guide
- `DEPLOYMENT.md` - Production deployment instructions
- `PROJECT_SUMMARY.md` - Complete feature summary
- `PRIVACY.md` - Privacy policy
