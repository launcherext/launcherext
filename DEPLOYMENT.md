# Launch Ext - Deployment Guide

This guide covers deploying the Launch Ext Chrome extension and its backend services to production.

## Prerequisites

- Node.js 16+ and npm
- Chrome browser for testing
- Vercel or Railway account (for backend)
- Chrome Web Store Developer account ($5 one-time fee)
- PumpPortal API key

## Part 1: Backend Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Prepare the backend:**
```bash
cd ../quickbanner
npm install
```

2. **Set up environment variables in Vercel:**
   - `PUMPPORTAL_API_KEY` - Your PumpPortal API key
   - `SOLANA_RPC_URL` - Solana RPC endpoint (e.g., Helius, QuickNode)
   - `POSTGRES_PRISMA_URL` - PostgreSQL connection string (pooling)
   - `POSTGRES_URL_NON_POOLING` - PostgreSQL direct connection
   - `JWT_SECRET` - Random secure string for JWT signing
   - `AI_PROVIDER_KEY` - API key for AI banner generation

3. **Deploy:**
```bash
vercel --prod
```

4. **Note your deployment URL** (e.g., `https://your-app.vercel.app`)

### Option B: Deploy to Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and create project:**
```bash
railway login
railway init
```

3. **Add PostgreSQL:**
```bash
railway add postgres
```

4. **Set environment variables:**
```bash
railway variables set PUMPPORTAL_API_KEY=your-api-key
railway variables set SOLANA_RPC_URL=your-rpc-url
railway variables set JWT_SECRET=your-secret
```

5. **Deploy:**
```bash
railway up
```

### Database Setup

1. **Run Prisma migrations:**
```bash
cd ../quickbanner
npx prisma migrate deploy
```

2. **Verify database:**
```bash
npx prisma studio
```

## Part 2: Extension Build & Packaging

### Build the Extension

1. **Update backend URL:**
   Edit `extension/lib/api-client.ts`:
   ```typescript
   const DEFAULT_BACKEND_URL = 'https://your-deployed-backend.vercel.app';
   ```

2. **Install dependencies:**
   ```bash
   cd launch-ext
   npm install
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Verify build:**
   - Check that `dist/` folder is created
   - Verify `manifest.json`, `popup.html`, `popup.js`, and `background.js` are present

### Test Locally

1. **Load unpacked extension:**
   - Open Chrome: `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

2. **Test all features:**
   - ✅ Connect wallet (both external and embedded)
   - ✅ Generate banner
   - ✅ Launch token (testnet first!)
   - ✅ View dashboard
   - ✅ Check history

### Package for Chrome Web Store

1. **Create production build:**
   ```bash
   npm run build
   ```

2. **Create ZIP file:**
   ```bash
   cd dist
   # Windows PowerShell:
   Compress-Archive -Path * -DestinationPath ../launch-ext-v1.0.0.zip
   
   # macOS/Linux:
   zip -r ../launch-ext-v1.0.0.zip .
   ```

3. **Verify ZIP contents:**
   - manifest.json
   - popup.html
   - popup.js
   - background.js
   - public/ (icons)
   - All assets

## Part 3: Chrome Web Store Submission

### Prepare Store Listing

1. **Create promotional assets:**
   - Icon: 128x128px PNG
   - Screenshots: 1280x800px or 640x400px (at least 1)
   - Small tile: 440x280px
   - Large tile: 920x680px (optional)
   - Marquee: 1400x560px (optional)

2. **Write store description:**
   ```
   Launch Ext - Create & Launch Memecoins Instantly
   
   Launch Ext is a Chrome extension that enables you to generate AI-powered 
   meme coin banners and launch tokens on pump.fun directly from your browser.
   
   Features:
   ✨ AI Banner Generation
   🚀 One-Click Token Launch
   💼 Dual Wallet Support
   📊 Launch Tracking Dashboard
   💰 P/L Calculation
   
   Perfect for meme coin creators and traders on Solana!
   ```

3. **Categories:**
   - Primary: Productivity
   - Secondary: Developer Tools

### Submit to Chrome Web Store

1. **Go to Chrome Web Store Developer Dashboard:**
   https://chrome.google.com/webstore/devconsole

2. **Click "New Item"**

3. **Upload your ZIP file**

4. **Fill in details:**
   - Name: Launch Ext
   - Summary: Create & Launch Memecoins Instantly
   - Description: (use prepared description)
   - Category: Productivity
   - Language: English

5. **Upload promotional assets**

6. **Set pricing:**
   - Free (or set a price)

7. **Select distribution:**
   - Public (or Unlisted for testing)

8. **Fill in privacy policy:**
   - Create a privacy policy (see PRIVACY.md)
   - Host it on your backend domain

9. **Submit for review:**
   - Click "Submit for Review"
   - Review typically takes 1-3 days

## Part 4: Post-Deployment

### Monitor & Maintain

1. **Set up monitoring:**
   - Backend errors (Vercel/Railway dashboard)
   - Extension errors (Chrome Web Store console)
   - User feedback

2. **Analytics:**
   - Track extension installs
   - Monitor token launches
   - Analyze user behavior

3. **Updates:**
   - Fix bugs promptly
   - Add new features
   - Update dependencies

### Update Process

1. **Make changes to code**

2. **Update version in manifest.json:**
   ```json
   {
     "version": "1.0.1"
   }
   ```

3. **Build and package:**
   ```bash
   npm run build
   cd dist && zip -r ../launch-ext-v1.0.1.zip .
   ```

4. **Upload to Chrome Web Store:**
   - Go to developer dashboard
   - Click on your extension
   - Click "Upload Updated Package"
   - Submit for review

## Troubleshooting

### Common Issues

**Extension won't load:**
- Check manifest.json syntax
- Verify all required files are in dist/
- Check browser console for errors

**Backend API errors:**
- Verify environment variables
- Check CORS settings
- Test API endpoints with Postman

**Wallet connection fails:**
- Ensure Phantom/Solflare is installed
- Check for console errors
- Verify wallet permissions

**Token launch fails:**
- Check wallet balance (need SOL for gas + dev buy)
- Verify PumpPortal API key
- Check Solana RPC endpoint

### Support

For issues and questions:
- GitHub Issues: [your-repo-url]
- Email: [your-email]
- Twitter: [@yourhandle]

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable rate limiting
- [ ] Set up HTTPS for backend
- [ ] Encrypt sensitive data
- [ ] Add CSP headers
- [ ] Enable CORS only for extension origin
- [ ] Monitor for suspicious activity
- [ ] Set up backup for database
- [ ] Test with small SOL amounts first
- [ ] Have emergency shutdown procedure

## Cost Estimates

**Backend (Vercel Pro):**
- ~$20/month for Hobby
- ~$20/month for Pro (recommended)

**Database (Neon/Supabase):**
- Free tier: 500MB
- Pro: $25/month for 10GB

**Solana RPC (Helius/QuickNode):**
- Free tier: 100k requests/day
- Pro: $50-200/month

**Chrome Web Store:**
- One-time: $5 developer fee

**Total:** ~$50-100/month for production

## Conclusion

You're now ready to deploy Launch Ext! Remember to:
- Test thoroughly before launch
- Start with testnet
- Monitor closely after launch
- Respond to user feedback
- Keep dependencies updated

Good luck with your launch! 🚀
