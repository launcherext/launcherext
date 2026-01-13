# DexDrip

> "Speed is the only edge left."

<div align="center">
  <img src="public/mainlogo.svg" alt="DexDrip Logo" width="100%" />

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Twitter](https://img.shields.io/twitter/follow/dexdripfun?style=social)](https://x.com/dexdripfun)
</div>

<br />

DexDrip is an open-source, AI-powered trading terminal and launchpad on Solana. We automate the "vibe check" -> "meme creation" -> "token launch" loop, allowing you to compete against machines.

## ⚡ Features

- **Tweet Sniper**: Analyzes viral tweets using Gemini AI to instantly generate meme coin concepts (Ticker, Name, Tagline, Art).
- **AI Art Engine**: Multi-mode generation (Banner + PFP) using Pollinations.ai (Free) or Replicate/Stable Diffusion.
- **Auto Launch**: One-click token deployment to Pump.fun via PumpPortal.
- **Privacy First**: Local wallet management and shadow routing.

## 💎 Tokenomics ($DRIP)

$DRIP is a utility token that grants access to professional features.

- **Tweet Sniper Access**: Hold **1,000,000 $DRIP** to unlock AI tweet analysis.
- **Pro Features**: Future access to Shadow Bundles and Turbo RPC.
- **No Tax**: 0/0.

[**📄 Read the Whitepaper**](docs/WHITEPAPER.md)

## 🏗️ The Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **AI**: Google Gemini 2.0 Flash (Analysis) + Pollinations/Replicate (Generation)
- **Blockchain**: Solana (Web3.js) + PumpPortal API
- **Database**: PostgreSQL (Prisma) - Optional for persistence

## 🚀 Getting Started

You are competing against machines. Join us.

### Prerequisites

1. **Node.js 20+** and **pnpm**
2. **Solana Wallet** (Phantom/Solflare)
3. **API Keys** (See Environment Setup)

### Installation

```bash
git clone https://github.com/nullxnothing/dexdrip.git
cd dexdrip
pnpm install
```

### Environment Setup

Copy the example env file:
```bash
cp .env.example .env.local
```

Fill in your keys (see `.env.example` for details on where to get them):
- `GEMINI_API_KEY`: For tweet analysis (Free tier available)
- `SOLANA_RPC_URL`: For blockchain data
- `PUMP_PORTAL_API_KEY`: For auto-launching (Optional for dev)

### Run It

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start sniping.

## 🤝 Contributing

We are building the fastest retail trading terminal. If you want to add a feature, fix a bug, or optimize a route:

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

MIT
