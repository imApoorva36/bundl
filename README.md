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

- **1inch API Integration**: Comprehensive use of 1inch swap, price feeds, and wallet balance APIs
- **Custom Predicate Contracts**: Scheduled swap execution through extended 1inch Limit Order Protocol
- **ERC721Proxy Integration**: Enable NFT portfolio transfers through limit order mechanisms
- **Secure Asset Transfers**: Maker asset suffix implementation ensuring only intended receivers get NFTs
- **Scheduled Portfolio Operations**: Time-based portfolio rebalancing and asset management

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
- **BundlExecutor**: Execution logic for portfolio operations and swap coordination
- **Custom Predicate Contracts**: Extended 1inch LOP logic for scheduled swaps and time-based operations
- **ERC721Proxy**: Specialized contract enabling NFT portfolio transfers through limit orders
- **Maker Asset Suffix System**: Security layer ensuring only intended recipients receive portfolio NFTs
- **OrderBook Backend**: Django API for order management, indexing, and bot coordination
- **Automated Execution Bot**: System that monitors and executes scheduled portfolio operations

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Wagmi, TanStack Query, Tailwind CSS + shadcn/ui
- **Smart Contracts**: Solidity, OpenZeppelin, Hardhat
- **Backend**: Django, PostgreSQL
- **Blockchain Integration**: 1inch APIs, Limit Order Protocol, ERC-721 NFTs

## 1inch Limit Order Protocol Extensions

bundl extends the 1inch Limit Order Protocol with novel NFT portfolio transfer mechanisms and scheduled swap functionality:

### Custom Predicate for Scheduled Operations
- **Time-Based Swap Execution**: Custom predicates that enable scheduled portfolio rebalancing
- **Conditional Portfolio Transfers**: Execute NFT portfolio transfers based on specific conditions
- **Automated Strategy Triggers**: Set future dates for portfolio operations and swaps
- **Multi-Step Transaction Coordination**: Orchestrate complex portfolio operations through predicates
- **Bot-Driven Execution**: Backend system monitors predicate conditions and triggers execution

### ERC721Proxy Integration
- **NFT Portfolio Transfers via LOP**: Revolutionary integration allowing portfolio NFTs to be transferred through limit orders
- **Seamless Portfolio Trading**: Use 1inch limit order infrastructure for portfolio NFT exchanges
- **Cross-Protocol Compatibility**: Bridge NFT portfolios with DeFi trading mechanisms
- **Secure Transfer Mechanisms**: Leverage limit order security for high-value portfolio transfers

### Maker Asset Suffix Security
- **Intended Recipient Validation**: Maker asset suffix ensures only designated receivers can claim portfolio NFTs
- **Anti-MEV Protection**: Prevent front-running and unauthorized portfolio claims
- **Secure Portfolio Gifting**: Guarantee that portfolio gifts reach the correct recipient
- **Permission-Based Transfers**: Advanced access control for portfolio NFT distribution

### OrderBook Backend & Automation
- **Django-Powered Order Management**: Robust backend system for tracking limit orders and scheduled operations
- **Automated Bot Execution**: Intelligent bot system that monitors conditions and executes scheduled swaps
- **Order State Tracking**: Comprehensive order lifecycle management and status monitoring
- **Real-Time Processing**: Continuous monitoring of market conditions and execution triggers

### Comprehensive 1inch API Utilization
- **Swap Protocol Integration**: Full integration with 1inch swap APIs for portfolio rebalancing
- **Price Feed Integration**: Real-time asset pricing for portfolio valuation and decisions
- **Wallet Balance Tracking**: Monitor portfolio compositions across multiple tokens
- **Transaction Optimization**: Use 1inch routing for optimal swap execution within portfolios

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
NEXT_PUBLIC_ONEINCH_API_KEY=your_api_key_here
```

## Usage

### Creating Your First Portfolio

1. **Connect Wallet**: Connect your MetaMask to the supported network
2. **Create Folder**: Mint a new portfolio NFT with a custom name
3. **Add Assets**: Transfer tokens to your portfolio's unique wallet address
4. **Organize & Trade**: Use the interface to swap tokens and manage your portfolio
5. **Gift or Transfer**: Send your entire portfolio as an NFT to others

## Innovation Highlights

### 1inch Limit Order Protocol Innovation
- **NFT Portfolio Transfers via LOP**: First implementation of ERC721 portfolio transfers through limit order protocol
- **Custom Predicate Development**: Advanced scheduled swap execution extending 1inch LOP capabilities
- **Maker Asset Suffix Security**: Novel security mechanism ensuring safe portfolio NFT transfers
- **Scheduled Portfolio Operations**: Time-based portfolio management through custom predicates

### Novel DeFi Mechanisms
- **Portfolio NFT Infrastructure**: Revolutionary system for bundling and transferring asset collections
- **Cross-Protocol Portfolio Trading**: Bridge between NFT ownership and DeFi trading mechanisms
- **Secure Portfolio Gifting**: Cryptographically secure system for sharing curated asset collections
- **Comprehensive 1inch Integration**: Full utilization of 1inch APIs for swap, pricing, and balance data

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
