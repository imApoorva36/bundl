import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      'https://api.1inch.dev/portfolio/portfolio/v5.0/general/supported_chains',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch supported chains' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching supported chains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
