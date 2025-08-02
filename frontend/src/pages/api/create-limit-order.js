require('dotenv').config();
const { LimitOrder, MakerTraits, Address, randBigInt, Extension } = require('@1inch/limit-order-sdk');
const { Wallet, Interface, Contract, JsonRpcProvider } = require('ethers');
const fetch = require('node-fetch');

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

async function createAndSubmitLimitOrder(nftTokenId, receiver, scheduledAt = 86400) {
  try {
    const privKey = process.env.PRIVATE_KEY;
    const provider = new JsonRpcProvider("https://sepolia.base.org");
    const maker = new Wallet(privKey, provider);

    const expiration = BigInt(Math.floor(Date.now() / 1000)) + BigInt(7*86400);
    const UINT_40_MAX = (1n << 40n) - 1n;

    // Set the HAS_EXTENSION flag for the maker traits
    const makerTraits = MakerTraits.default()
      .withExpiration(expiration)
      .withNonce(randBigInt(UINT_40_MAX))
      .withExtension();

    // Create predicate for NFT condition
    const predicateAbi = [
      "function isReadyToTransfer(address,uint256,address,uint256) view returns (uint256)"
    ];
    const predicateContractAddress = process.env.PREDICATE_CONTRACT_ADDRESS;
    const predicateIface = new Interface(predicateAbi);
      
    const timestamp = Math.floor(Date.now() / 1000) + scheduledAt
    const predicateCallData = predicateIface.encodeFunctionData("isReadyToTransfer", [
      process.env.NFT_CONTRACT_ADDRESS,
      nftTokenId, // tokenId
      maker.address,
      timestamp // validAfter
    ]);

    // Then wrap it in arbitraryStaticCall
    const arbitraryStaticCallAbi = [
      "function arbitraryStaticCall(address target, bytes calldata data) view returns (uint256)"
    ];
    const arbitraryIface = new Interface(arbitraryStaticCallAbi);

    const predicate = arbitraryIface.encodeFunctionData("arbitraryStaticCall", [
      predicateContractAddress, // target contract
      predicateCallData         // encoded function call
    ]);

    // ERC721 Proxy setup
    const erc721ProxyAddress = process.env.PROXY_CONTRACT_ADDRESS;
    const erc721ProxyAbi = [
      "function func_60iHVgK(address from, address to, uint256 amount, uint256 tokenId, address token)"
    ];
    const erc721proxy = new Interface(erc721ProxyAbi);

    // Create maker asset suffix (NFT being sold)
    const makerAssetSuffix = '0x' + erc721proxy.encodeFunctionData(
      'func_60iHVgK',
      [
        maker.address,                    // from (maker)
        receiver,                         // to (receiver)
        0,                                // amount (not used for ERC721)
        nftTokenId,                       // tokenId
        process.env.NFT_CONTRACT_ADDRESS  // NFT token contract
      ]
    ).substring(202);

    // Create extension with asset suffixes
    const extension = new Extension();
    extension.predicate = predicate;
    extension.makerAssetSuffix = makerAssetSuffix;

    // Approve the NFT asset transfer
    const erc721AbiFragment = [
      "function approve(address to, uint256 tokenId)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function setApprovalForAll(address operator, bool approved)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)"
    ];

    const nftContract = new Contract(
      process.env.NFT_CONTRACT_ADDRESS,
      erc721AbiFragment, 
      maker
    );

    // Check if the specific token is already approved
    const currentApproved = await nftContract.getApproved(nftTokenId);
    console.log(`Current approved address for token ${nftTokenId}: ${currentApproved}`);

    // Approve the ERC721 proxy for NFT transfers
    const approvalTarget = process.env.PROXY_CONTRACT_ADDRESS;

    if (currentApproved.toLowerCase() !== approvalTarget.toLowerCase()) {
      const approveTx = await nftContract.approve(approvalTarget, nftTokenId);
      await approveTx.wait();
      console.log(`NFT token ${nftTokenId} approved for ERC721 proxy`);
    }

    // Create the limit order with proxy addresses 
    const order = new LimitOrder({
      makerAsset: new Address(erc721ProxyAddress), // Use proxy address for NFT
      takerAsset:  new Address("0x4200000000000000000000000000000000000006"),
      makingAmount: 1n,                            // Not used by ERC721Proxy but required
      takingAmount: 1n,                            // Not used by ERC721Proxy (actual amount in suffix: 1 wei)
      maker: new Address(maker.address),
    }, makerTraits, extension);
    
    console.log('Created limit order:', order);
    console.log('Trading NFT tokenId:', nftTokenId, 'for 1 wei WETH');

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
      receiver: order.receiver?.toString() || null,
      makingAmount: order.makingAmount.toString(),
      takingAmount: order.takingAmount.toString(),
      salt: order.salt?.toString() || null,
      makerTraits: order.makerTraits.value.value.toString(),

      // Full extension object
      extension: {
        makerAssetSuffix: extension.makerAssetSuffix,
        takerAssetSuffix: extension.takerAssetSuffix,
        makingAmountData: extension.makingAmountData,
        takingAmountData: extension.takingAmountData,
        predicate: extension.predicate,
        makerPermit: extension.makerPermit,
        preInteraction: extension.preInteraction,
        postInteraction: extension.postInteraction,
        customData: extension.customData
      }
    },
    networkId: networkId
  };

    // Submit to Django backend
    const result = await makeHttpRequest('/api/orders/', 'POST', orderData);
    console.log('Order submitted successfully to Django backend!');    
    return result;
  } catch (err) {
    console.error('Failed to create and submit limit order:', err);
    throw err;
  }
}

// Pages Router API Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nftTokenId, receiver, scheduledAt } = req.body;
    // Validate required parameters
    if (!nftTokenId || !receiver) {
      return res.status(400).json({ 
        error: 'Missing required parameters: nftTokenId and receiver are required' 
      });
    }

    const result = await createAndSubmitLimitOrder(
      nftTokenId, 
      receiver, 
      scheduledAt || 86400
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
