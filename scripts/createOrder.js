require('dotenv').config();

const { LimitOrder, MakerTraits, Address, randBigInt } = require('@1inch/limit-order-sdk');
const { Wallet, Interface } = require('ethers');
const fetch = require('node-fetch');

const privKey = process.env.PRIVATE_KEY;
const maker = new Wallet(privKey);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// HTTP request helper
async function makeHttpRequest(endpoint, method = 'GET', data = null) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('HTTP request failed:', error);
    throw error;
  }
}

async function createAndSubmitLimitOrder() {
  try {
    const expiresIn = 120n; //TODO: Tweak this value
    const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
    const UINT_40_MAX = (1n << 40n) - 1n;

    const makerTraits = MakerTraits.default().withExpiration(expiration).withNonce(randBigInt(UINT_40_MAX));

    // Create predicate for NFT condition
    const abi = [
      "function isReadyToTransfer(address,uint256,address,uint256) view returns (bool)"
    ];
    const predicateContractAddress = process.env.PREDICATE_CONTRACT_ADDRESS;
    const iface = new Interface(abi);

    const predicate = iface.encodeFunctionData("isReadyToTransfer", [
      process.env.NFT_CONTRACT_ADDRESS, // NFT contract address
      1234, // tokenId
      predicateContractAddress,
      Math.floor(Date.now() / 1000) + 3600
    ]);

    // Create the limit order
    const order = new LimitOrder({
      makerAsset: new Address('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      takerAsset: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
      makingAmount: 100_000000n,
      takingAmount: 10_00000000000000000n,
      maker: new Address(maker.address),
    }, makerTraits);

    const networkId = 84532; // baseSepolia Testnet
    const typedData = order.getTypedData(networkId);

    // Sign the order
    const signature = await maker.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    // Prepare order data for Django backend
    const orderData = {
      orderHash: order.getOrderHash(networkId),
      signature,
      data: {
        makerAsset: order.makerAsset.toString(),
        takerAsset: order.takerAsset.toString(),
        maker: order.maker.toString(),
        receiver: order.receiver?.toString(),
        makingAmount: order.makingAmount.toString(),
        takingAmount: order.takingAmount.toString(),
        salt: order.salt?.toString(),
        extension: predicate,
        makerTraits: order.makerTraits.value.value.toString()
      },
      networkId: networkId
    };

    console.log('Creating limit order...');
    console.log('Order Hash:', orderData.orderHash);

    // Submit to Django backend
    const result = await makeHttpRequest('/api/orders/', 'POST', orderData);
    
    console.log('Order submitted successfully to Django backend!');
    console.log('Backend Response:', result);
    
    return result;
    
  } catch (err) {
    console.error('Failed to create and submit limit order:', err);
  }
}

// Additional helper functions for interacting with Django backend
async function getOrderByHash(orderHash) {
  try {
    const result = await makeHttpRequest(`/api/orders/${orderHash}/`);
    console.log('Order details:', result);
    return result;
  } catch (error) {
    console.error('Failed to get order:', error);
  }
}

async function getOrdersByMaker(makerAddress, status = null) {
  try {
    let endpoint = `/api/orders/maker/${makerAddress}/`;
    if (status) {
      endpoint += `?status=${status}`;
    }
    
    const result = await makeHttpRequest(endpoint);
    console.log(`Orders for maker ${makerAddress}:`, result);
    return result;
  } catch (error) {
    console.error('Failed to get orders by maker:', error);
  }
}

async function cancelOrder(orderHash) {
  try {
    const result = await makeHttpRequest(`/api/orders/${orderHash}/cancel/`, 'POST');
    console.log('Order cancelled:', result);
    return result;
  } catch (error) {
    console.error('Failed to cancel order:', error);
  }
}

async function getOrderStatus(orderHash) {
  try {
    const result = await makeHttpRequest(`/api/orders/${orderHash}/status/`);
    console.log('Order status:', result);
    return result;
  } catch (error) {
    console.error('Failed to get order status:', error);
  }
}

async function getActiveOrders(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const endpoint = `/api/orders/active/?${params}`;
    
    const result = await makeHttpRequest(endpoint);
    console.log('Active orders:', result);
    return result;
  } catch (error) {
    console.error('Failed to get active orders:', error);
  }
}

async function getOrderbook(makerAsset, takerAsset) {
  try {
    const params = new URLSearchParams({ makerAsset, takerAsset });
    const endpoint = `/api/orderbook/?${params}`;
    
    const result = await makeHttpRequest(endpoint);
    console.log('Orderbook data:', result);
    return result;
  } catch (error) {
    console.error('Failed to get orderbook:', error);
  }
}

async function main() {
  console.log('Starting orderbook interaction...\n');
  
  const submittedOrder = await createAndSubmitLimitOrder();
  
  if (submittedOrder && submittedOrder.success) {
    const orderHash = submittedOrder.order.order_hash;
    
    setTimeout(async () => {
      console.log('\nChecking submitted order...');
      await getOrderByHash(orderHash);
      await getOrderStatus(orderHash);
      
      // Get orders by maker
      console.log('\nGetting all orders by maker...');
      await getOrdersByMaker(maker.address);
      
      // Get active orders
      console.log('\nGetting active orders...');
      await getActiveOrders({ maker: maker.address });
      
    }, 1000);
  }
}

module.exports = {
  createAndSubmitLimitOrder,
  getOrderByHash,
  getOrdersByMaker,
  cancelOrder,
  getOrderStatus,
  getActiveOrders,
  getOrderbook,
  makeHttpRequest
};

if (require.main === module) {
  main();
}