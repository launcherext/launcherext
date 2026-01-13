# Launch Ext 🚀

**Create & Launch Memecoins Instantly**

Launch Ext is a Chrome extension that enables you to generate AI-powered meme coin banners and launch tokens on pump.fun directly from your browser.

## Features

- ✨ **AI Banner Generation** - Create professional meme coin banners with AI
- 🚀 **One-Click Token Launch** - Launch tokens on pump.fun via PumpPortal API
- 💼 **Dual Wallet Support** - Connect external wallets (Phantom/Solflare) or create an embedded wallet
- 📊 **Launch Tracking Dashboard** - Track all your token launches with real-time stats
- 💰 **P/L Calculation** - Monitor profit and loss for each launched token
- 🎨 **pump.fun-Inspired Design** - Dark theme with green accents for a sleek UI

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Chrome browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/launch-ext.git
cd launch-ext
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

Run webpack in watch mode for hot reloading:
```bash
npm run dev
```

Then reload the extension in Chrome after making changes.

## Project Structure

```
launch-ext/
├── extension/
│   ├── manifest.json          # Chrome extension config
│   ├── popup/                 # React popup UI
│   │   ├── App.tsx           # Main app component
│   │   ├── components/       # UI components
│   │   └── styles/           # CSS and animations
│   ├── background/           # Service worker
│   ├── lib/                  # Utility libraries
│   └── public/               # Static assets (icons)
├── package.json
├── webpack.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Configuration

### Backend URL

The extension connects to a backend API for banner generation and launch tracking. Set the backend URL in the extension settings or update `extension/lib/api-client.ts`:

```typescript
const DEFAULT_BACKEND_URL = 'https://your-backend-url.com';
```

### Environment Variables

Backend environment variables (in your Next.js backend):
- `PUMPPORTAL_API_KEY` - Your PumpPortal API key
- `SOLANA_RPC_URL` - Solana RPC endpoint
- `POSTGRES_*` - Database connection strings
- `AI_PROVIDER_KEY` - API key for AI banner generation

## Usage

1. **Connect Wallet** - Click "Connect Wallet" and choose external or embedded wallet
2. **Generate Banner** - Enter a prompt and click "Generate Banner"
3. **Edit Metadata** - Fill in token name, symbol, description, and social links
4. **Launch Token** - Click "Launch Token" and confirm the transaction
5. **Track Performance** - View your launched tokens in the Dashboard tab

## Design System

Launch Ext uses a pump.fun-inspired design system:

- **Colors:**
  - Background: `#0a0a0a` (deep black)
  - Accent Green: `#00ff88`
  - Card Background: `#1a1a1a`

- **Components:**
  - Token Cards with hover effects
  - Green CTA buttons
  - Live badges for recent launches
  - Progress bars for market cap visualization

## Backend Integration

Launch Ext requires a backend service for:
- AI banner generation
- IPFS upload proxy (to avoid CORS)
- Launch data storage
- Token stats fetching

See the `quickbanner` Next.js application for the backend implementation.

## Security

- Private keys are never sent to the backend
- Embedded wallet keys are encrypted with user password
- All API calls use HTTPS
- Wallet auto-locks after inactivity

## Building for Production

1. Build the extension:
```bash
npm run build
```

2. The built extension will be in the `dist` folder

3. Create a `.zip` file for Chrome Web Store submission:
```bash
cd dist
zip -r launch-ext.zip .
```

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the Solana meme coin community**
