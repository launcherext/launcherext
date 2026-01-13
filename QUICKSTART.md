# Launch Ext - Quick Start Guide

Get up and running with Launch Ext in minutes!

## For Developers

### Prerequisites
- Node.js 16+ and npm
- Chrome browser
- Access to quickbanner backend (for AI generation)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend URL
Edit `extension/lib/api-client.ts`:
```typescript
const DEFAULT_BACKEND_URL = 'http://localhost:3000'; // or your deployed URL
```

### 3. Build the Extension
```bash
npm run build
```

### 4. Load in Chrome
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder

### 5. Test
- Click the extension icon
- Connect a wallet (testnet recommended)
- Generate a banner
- Launch a test token

## For End Users

### Installation

**From Chrome Web Store (when published):**
1. Visit Chrome Web Store
2. Search for "Launch Ext"
3. Click "Add to Chrome"

**Manual Installation:**
1. Download the latest release ZIP
2. Extract to a folder
3. Open Chrome: `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

### First Time Setup

1. **Click the extension icon** in your Chrome toolbar

2. **Connect Your Wallet**
   - Choose "External Wallet" to use Phantom/Solflare
   - Or "Create New Wallet" for an embedded wallet

3. **Fund Your Wallet**
   - You need SOL for:
     - Gas fees (~0.001 SOL)
     - Dev buy amount (minimum 0.01 SOL)
   - Recommended: Start with 0.5 SOL

### Creating Your First Token

1. **Go to "Create" Tab**

2. **Generate Banner**
   - Enter a prompt describing your meme coin
   - Select a style
   - Click "Generate Banner"

3. **Fill Token Details**
   - Token Name (max 32 chars)
   - Symbol (max 10 chars)
   - Description (max 500 chars)
   - Social links (optional)

4. **Set Dev Buy Amount**
   - Use slider to set initial purchase (0.01-5 SOL)
   - This is how much SOL you'll use to buy your token

5. **Launch Token**
   - Click "Launch Token"
   - Approve transaction in your wallet
   - Wait for confirmation (~30 seconds)

6. **View Your Token**
   - Check Dashboard tab to see your launch
   - Click card to open on pump.fun

### Using the Dashboard

- **View All Tokens:** See all your launched tokens
- **Filter:** Show All / Profitable / Loss-making
- **Sort:** Recent / Biggest Gain / Biggest Loss
- **Auto-Refresh:** Stats update every 30 seconds
- **Manual Refresh:** Click refresh button anytime

### History Tab

- View complete launch history
- See transaction signatures
- Quick links to pump.fun and Solscan
- Track when each token was launched

## Tips & Best Practices

### For Testing
- ✅ Start with Solana devnet
- ✅ Use small SOL amounts
- ✅ Test all features before mainnet
- ✅ Backup your wallet seed phrase

### For Production
- 💰 Keep wallet funded (gas fees add up)
- 🎨 Create high-quality banners
- 📝 Write engaging descriptions
- 🔗 Add social links for credibility
- 📊 Monitor dashboard regularly

### Security
- 🔒 Never share private keys
- 🔑 Use strong passwords for embedded wallets
- 💾 Backup wallet recovery phrases
- 🛡️ Only download from official sources
- ⚠️ Beware of phishing sites

## Troubleshooting

### Extension Won't Load
- Check Chrome version (need 88+)
- Try reloading: Toggle "Developer mode" off/on
- Check browser console for errors

### Wallet Connection Fails
- Ensure Phantom/Solflare is installed
- Try refreshing the page
- Check wallet is unlocked
- Verify network (mainnet vs devnet)

### Banner Generation Fails
- Check backend is running
- Verify API endpoint in settings
- Check browser console for errors
- Try a simpler prompt

### Token Launch Fails
- **Insufficient funds:** Add more SOL
- **Transaction failed:** Check Solana network status
- **Timeout:** Network congestion, try again
- **Invalid signature:** Unlock wallet and retry

### Stats Not Updating
- Click manual refresh
- Check internet connection
- Verify Solana RPC endpoint
- Wait 30s for auto-refresh

## Support & Community

- 🐛 **Bug Reports:** [GitHub Issues]
- 💬 **Discord:** [Your Discord]
- 🐦 **Twitter:** [@YourHandle]
- 📧 **Email:** [your@email.com]

## Keyboard Shortcuts

- `Alt+Shift+L` - Open Launch Ext popup (configure in Chrome)
- `Ctrl/Cmd + R` - Refresh stats
- `Tab` - Navigate between tabs

## Advanced Features

### Custom RPC Endpoint
Settings > Network > Custom RPC
- Faster transactions
- More reliable
- Recommended: Helius or QuickNode

### Export Launch Data
History > ⚙️ > Export CSV
- Backup your launches
- Track performance
- Tax reporting

### Batch Operations
(Coming soon)
- Launch multiple tokens
- Bulk stats refresh
- Portfolio analytics

## Resources

- 📖 Full Documentation: [Link]
- 🎥 Video Tutorials: [Link]
- 💡 Examples: [Link]
- 🔧 API Docs: [Link]

## What's Next?

After launching your first token:

1. **Share on Social Media**
   - Twitter
   - Telegram
   - Discord

2. **Monitor Performance**
   - Check dashboard regularly
   - Track P/L
   - Watch holder count

3. **Engage Community**
   - Respond to comments
   - Build hype
   - Create memes

4. **Launch More Tokens**
   - Learn from experience
   - Iterate on strategy
   - Build your brand

## Contributing

Want to contribute?
- Fork the repo
- Create a feature branch
- Submit a pull request
- Join our Discord

---

**Ready to launch? Let's go! 🚀**

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
