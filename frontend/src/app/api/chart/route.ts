import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract required parameters
    const token0 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const seconds = searchParams.get('seconds');
    const chainId = '1'; // Default to Ethereum mainnet
    
    // Validate required parameters
    if (!token0 || !token1 || !seconds) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters. Required: token0, token1, seconds. Optional: chainId (defaults to 1)' 
        },
        { status: 400 }
      );
    }
    
    // Validate seconds parameter (supported values)
    const supportedSeconds = [300, 900, 3600, 14400, 86400, 604800];
    const secondsNum = parseInt(seconds);
    if (!supportedSeconds.includes(secondsNum)) {
      return NextResponse.json(
        { 
          error: `Invalid seconds parameter. Supported values: ${supportedSeconds.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Validate chainId parameter (supported chains)
    const supportedChains = [1, 56, 137, 42161, 43114, 100, 10, 8453, 324, 59144, 146, 130];
    const chainIdNum = parseInt(chainId);
    if (!supportedChains.includes(chainIdNum)) {
      return NextResponse.json(
        { 
          error: `Invalid chainId parameter. Supported chains: ${supportedChains.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Construct the API URL
    const apiUrl = `https://api.1inch.dev/charts/v1.0/chart/aggregated/candle/${token0}/${token1}/${seconds}/${chainId}`;
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ONEINCH_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    });

    console.log(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch chart data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
