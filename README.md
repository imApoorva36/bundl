# bundl

> **Ownable, tradable portfolios bundling assets as NFTs. Organize & send crypto like digital vaults.**

Developed by [Apoorva Agrawal](https://github.com/imApoorva36), [Fahim Ahmed](https://github.com/ahmedfahim21), and [Vedant Tarale](https://github.com/VedantTarale).

![bundl](./frontend/public/bundl.png)

## Overview

bundl transforms how users manage and trade cryptocurrency portfolios by introducing **portfolio NFTs** - tradable containers that bundle multiple assets together. Think of it as creating "digital investment vaults" that can be organized, shared, and traded as single units while maintaining full transparency and control.

## Key Features

### Portfolio NFTs

- **Folder-Based Organization**: Create folders as ERC-721 NFTs with unique wallet addresses
- **Multi-Asset Bundling**: Bundle ETH, ERC-20 tokens, and other digital assets in a single container
- **Transferable Portfolios**: Send entire portfolios as gifts or trades through NFT transfers
- **Transparent Ownership**: On-chain metadata for complete portfolio visibility

### Advanced Trading & Swapping

- **1inch Integration**: Seamless token swapping within portfolio folders using 1inch APIs
- **Extended Limit Order Protocol**: Custom predicates and advanced order strategies built on 1inch LOP
- **Automated Order Execution**: Smart bot system that monitors and executes limit orders every hour
- **Portfolio-Based Conditional Orders**: Place orders based on entire portfolio composition and performance
- **Custom Trading Strategies**: TWAP, DCA, and rebalancing strategies with automated execution

### Social & Gifting Features

- **Portfolio Gifting**: Send entire collections of tokens as a single NFT gift
- **Folder Sharing**: Transfer ownership of curated asset collections
- **Asset Organization**: Drag-and-drop interface for managing tokens within folders
- **Cross-Portfolio Management**: Handle multiple portfolio strategies simultaneously

## Architecture

_Architecture diagram coming soon_

### Core Components

- **BundlCore**: Main contract managing portfolio NFTs and metadata
- **BundlRegistry**: Registry for token-bound accounts enabling portfolio wallets
- **BundlExecutor**: Execution logic for portfolio operations and automated strategies
- **Custom Predicate Contracts**: Extended 1inch LOP logic for portfolio-based conditional trading
- **OrderBook Backend**: Django API with automated bot for order management and execution
- **Hourly Execution Bot**: Automated system for monitoring and executing limit orders

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Wagmi, TanStack Query, Tailwind CSS + shadcn/ui
- **Smart Contracts**: Solidity, OpenZeppelin, Hardhat
- **Backend**: Django, PostgreSQL
- **Blockchain Integration**: 1inch APIs, Limit Order Protocol, ERC-721 NFTs

## 1inch Limit Order Protocol Extensions

bundl significantly expands the 1inch Limit Order Protocol with innovative portfolio-centric features:

### Custom Predicate Logic

- **Portfolio Composition Predicates**: Orders that execute based on portfolio asset ratios
- **Performance-Based Triggers**: Conditional orders based on portfolio value thresholds
- **Multi-Asset Strategies**: Complex orders involving multiple tokens within a portfolio
- **Time-Based Conditions**: Scheduled rebalancing and strategy execution

### Automated Order Management System

- **Hourly Bot Execution**: Automated system that monitors and executes orders every hour
- **Smart Order Matching**: Intelligent matching of portfolio-based limit orders
- **Strategy Automation**: Hands-off portfolio management through predefined rules
- **Real-Time Monitoring**: Continuous tracking of market conditions and order status

### Advanced Trading Strategies

- **Portfolio Rebalancing**: Automated maintenance of target asset allocations
- **TWAP Implementation**: Time-weighted average price execution for large orders
- **Dollar-Cost Averaging**: Scheduled recurring purchases with limit order precision
- **Conditional Swapping**: Execute trades only when portfolio conditions are met

## Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/imApoorva36/bundl.git
   cd bundl
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   cp example.env .env.local
   # Configure your environment variables
   npm run dev
   ```

3. **Smart Contract Setup**

   ```bash
   cd contract
   npm install
   # Deploy contracts (see deployment section)
   ```

4. **Backend Setup**
   ```bash
   cd orderbook-backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

### Environment Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_BUNDL_EXECUTOR_ADDRESS=0x...
NEXT_PUBLIC_BUNDL_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_BUNDL_CORE_ADDRESS=0x...
NEXT_PUBLIC_PREDICATE_ADDRESS=0x...
ONEINCH_API_KEY=your_api_key_here
```

## Usage

### Creating Your First Portfolio

1. **Connect Wallet**: Connect your MetaMask to the supported network
2. **Create Folder**: Mint a new portfolio NFT with a custom name
3. **Add Assets**: Transfer tokens to your portfolio's unique wallet address
4. **Organize & Trade**: Use the interface to swap tokens and manage your portfolio
5. **Gift or Transfer**: Send your entire portfolio as an NFT to others

## Innovation Highlights

### 1inch Limit Order Protocol Expansion

- **Portfolio-Centric Orders**: Revolutionary limit orders that consider entire portfolio composition
- **Automated Execution Infrastructure**: Sophisticated bot system running hourly order checks
- **Custom Predicate Development**: Advanced conditional logic extending 1inch LOP capabilities
- **Strategy Automation**: Set-and-forget portfolio management through intelligent order placement

### Novel Trading Mechanisms

- **Portfolio NFT Trading**: Trade entire curated asset collections as single transactions
- **Conditional Portfolio Rebalancing**: Automated asset allocation based on market conditions
- **Social Portfolio Gifting**: Revolutionary mechanism to share curated crypto collections
- **Intuitive Asset Management**: Drag-and-drop interface for complex portfolio operations

## Demo

Experience bundl live: [https://bundl-demo.vercel.app](https://bundl-demo.vercel.app)

## Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

### Ready to bundle your assets? Start organizing your crypto like never before!

**Team bundl** - Apoorva Agrawal, Fahim Ahmed & Vedant Tarale
