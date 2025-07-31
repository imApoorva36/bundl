// Price service for fetching token USD values
interface TokenPrice {
  symbol: string;
  address: string;
  price: number;
  timestamp: number;
}

class PriceService {
  private cache = new Map<string, TokenPrice>();
  private readonly CACHE_DURATION = 60000; // 1 minute in milliseconds
  
  // CoinGecko API endpoints
  private readonly COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
  
  // Known token mappings to CoinGecko IDs
  private readonly TOKEN_ID_MAP: Record<string, string> = {
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'WETH': 'weth',
    'DAI': 'dai',
    'EURC': 'euro-coin',
    // Add more as needed
  };

  // Get price by symbol (fallback method)
  async getPriceBySymbol(symbol: string): Promise<number> {
    const cacheKey = `symbol_${symbol.toUpperCase()}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      const coinId = this.TOKEN_ID_MAP[symbol.toUpperCase()];
      if (!coinId) {
        console.warn(`No CoinGecko ID mapping for symbol: ${symbol}`);
        return 0;
      }

      const response = await fetch(
        `${this.COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[coinId]?.usd || 0;

      // Cache the result
      this.cache.set(cacheKey, {
        symbol: symbol.toUpperCase(),
        address: '',
        price,
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return 0;
    }
  }

  // Get price by contract address (more accurate)
  async getPriceByAddress(address: string, chainId: number): Promise<number> {
    const cacheKey = `address_${address.toLowerCase()}_${chainId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      // Map chain IDs to CoinGecko platform names
      const platformMap: Record<number, string> = {
        1: 'ethereum',
        8453: 'base', // Base mainnet
        84532: 'base', // Base Sepolia (use same as Base for now)
        137: 'polygon-pos',
        42161: 'arbitrum-one',
      };

      const platform = platformMap[chainId];
      if (!platform) {
        console.warn(`Unsupported chain ID for price lookup: ${chainId}`);
        return 0;
      }

      // For ETH (zero address), use symbol-based lookup
      if (address === '0x0000000000000000000000000000000000000000') {
        return this.getPriceBySymbol('ETH');
      }

      const response = await fetch(
        `${this.COINGECKO_BASE}/simple/token_price/${platform}?contract_addresses=${address}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[address.toLowerCase()]?.usd || 0;

      // Cache the result
      this.cache.set(cacheKey, {
        symbol: '',
        address: address.toLowerCase(),
        price,
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for address ${address}:`, error);
      return 0;
    }
  }

  // Calculate USD value for a token amount
  async calculateUSDValue(
    balance: string,
    decimals: number,
    symbol: string,
    address?: string,
    chainId?: number
  ): Promise<string> {
    try {
      let price = 0;
      
      // Try to get price by address first (more accurate)
      if (address && chainId) {
        price = await this.getPriceByAddress(address, chainId);
      }
      
      // Fallback to symbol-based lookup
      if (price === 0) {
        price = await this.getPriceBySymbol(symbol);
      }

      if (price === 0) {
        return '$0.00';
      }

      // Convert balance to number (assuming balance is already formatted)
      const balanceNum = parseFloat(balance);
      const usdValue = balanceNum * price;

      // Format as USD
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdValue);
    } catch (error) {
      console.error('Error calculating USD value:', error);
      return '$0.00';
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const priceService = new PriceService();
