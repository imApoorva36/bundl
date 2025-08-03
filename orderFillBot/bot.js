// Execute ERC721 Limit Order on Base Sepolia
// Contract: 0x7Fd0282c8D02be2a03A6c9e543B276c42e27e119

const { ethers } = require('ethers');
const { Address, TakerTraits, Extension } = require('@1inch/limit-order-sdk');
require('dotenv').config();

// Setup provider for Base Sepolia
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract addresses
const LIMIT_ORDER_CONTRACT = '0x7Fd0282c8D02be2a03A6c9e543B276c42e27e119';
const ERC721_PROXY = '0x27460E998F915388eBAd2C1E5f102Fde1a6d0be1'
const ERC721_TOKEN = process.env.NFT_CONTRACT_ADDRESS;


// Contract ABI (updated for proper structure)
const limitOrderABI = [
    
    "function fillOrderArgs((uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes) external payable returns (uint256,uint256,bytes32)",
    "function fillLimitOrder((bytes,address,address,uint256,uint256,uint256,address,address,uint256) order, bytes signature, bytes interaction, uint256 makingAmount, uint256 takingAmount, uint256 skipPermitAndThresholdAmount) external",
    "function checkPredicate(bytes calldata predicate) external view returns (bool)",
    "function remaining(bytes32 orderHash) external view returns (uint256)",
    "function hashLimitOrder((bytes,address,address,uint256,uint256,uint256,address,address,uint256) order) external view returns (bytes32)"
];

const erc721ABI = [
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)"
];

function extractTokenIdFromMakerAssetSuffix(suffix) {
    console.log(suffix)
    const cleanSuffix = suffix.startsWith('0x') ? suffix.slice(2) : suffix;    
    const tokenIdHex = cleanSuffix.substring(0, 64);
    return parseInt(tokenIdHex, 16);
}


async function executeOrder() {
    const limitOrderContract = new ethers.Contract(LIMIT_ORDER_CONTRACT, limitOrderABI, wallet);
    const erc721Contract = new ethers.Contract(ERC721_TOKEN, erc721ABI, provider);
    const response = await fetch('http://localhost:8000/api/orders/active');
    const data = await response.json();
    const limitOrder = data.results[0];
    const extension = new Extension({
        makerAssetSuffix: limitOrder.extension.maker_asset_suffix,
        takerAssetSuffix: limitOrder.extension.taker_asset_suffix,
        makingAmountData: limitOrder.extension.making_amount_data,
        takingAmountData: limitOrder.extension.taking_amount_data,
        predicate: limitOrder.extension.predicate,
        makerPermit: limitOrder.extension.maker_permit,
        preInteraction: limitOrder.extension.pre_interaction,
        postInteraction: limitOrder.extension.post_interaction,
        customData: limitOrder.extension.custom_data
    });
    const tokenId = extractTokenIdFromMakerAssetSuffix(limitOrder.extension.maker_asset_suffix);

    console.log('=== Order Execution Process ===\n');

    // Step 1: Verify order validity
    console.log('1. Verifying order validity...');

    // Create proper order structure
    const orderStruct = [
        BigInt(limitOrder.salt),               // uint256 salt
        limitOrder.maker,                      // address maker
        limitOrder.receiver,                   // address receiver
        limitOrder.maker_asset,                // address makerAsset
        limitOrder.taker_asset,                // address takerAsset
        BigInt(limitOrder.making_amount),      // uint256 makingAmount
        BigInt(limitOrder.taking_amount),      // uint256 takingAmount
        BigInt(limitOrder.maker_traits),       // uint256 makerTraits
    ];

    
    // Get order hash
    const orderHash = limitOrder.order_hash
    console.log('Order hash:', orderHash);
    // Check remaining amount
    const filledAmount = limitOrder.filled_amount;
    
    if (filledAmount.toString() !== '0') {
        console.log('❌ Order already filled or cancelled');
        return;
    }

    // Step 2: Verify ERC721 ownership and approvals
    console.log('\n2. Verifying ERC721 token ownership and approvals...');
    try {
        const owner = await erc721Contract.ownerOf(tokenId);
        console.log('Token owner:', owner);
        console.log('Expected maker:', limitOrder.maker);
        
        if (owner.toLowerCase() !== limitOrder.maker.toLowerCase()) {
            console.log('❌ Maker does not own the token');
            return;
        }
        
        // Check approvals
        const approved = await erc721Contract.getApproved(tokenId);
        const approvedForAll = await erc721Contract.isApprovedForAll(owner, ERC721_PROXY);
        
        console.log('Token approved to:', approved);
        console.log('Approved for all:', approvedForAll);
        
        if (approved.toLowerCase() !== ERC721_PROXY.toLowerCase() && !approvedForAll) {
            console.log('❌ Token not approved for limit order contract');
            return;
        }
    } catch (error) {
        console.log('⚠️ Could not verify token ownership:', error.message);
    }
    
    // Step 3: Check predicate conditions
    console.log('\n3. Checking predicate conditions...');
    const tx = await wallet.sendTransaction({
        to: process.env.LOP_CONTRACT_ADDRESS,
        data: limitOrder.extension.predicate, // Your encoded arbitraryStaticCall data
        gasLimit: 200000
    });

    await tx.wait();
    console.log('Transaction hash:', tx.hash);
    try {
        const predicateValid = await limitOrderContract.checkPredicate(limitOrder.extension.predicate);
        console.log('Predicate valid:', predicateValid);
        
        if (!predicateValid) {
            console.log('❌ Predicate conditions not met');
            return;
        }
    } catch (error) {
        console.log('⚠️ Could not verify predicate, proceeding with caution');
        console.log('Error:', error.message);
    }

    
    // Step 4: Get maker's signature
    console.log('\n4. Maker signature required...');    
    const MAKER_SIGNATURE = limitOrder.signature;
    console.log('Maker signature:', MAKER_SIGNATURE);

    // Step 5: Execute the fill
    console.log('\n5. Executing limit order fill...');
        // Encode extension properly

    const takerTraits = TakerTraits.default().setReceiver(Address.ZERO_ADDRESS).skipOrderPermit().setExtension(extension)
    const takerTraitsEncoded = takerTraits.encode();
    console.log('Taker traits encoded:', takerTraitsEncoded);
    try {
        const { r, vs } = splitSignature(limitOrder.signature);
        // Prepare transaction
        const tx = await limitOrderContract.fillOrderArgs(
            orderStruct,
            r,
            vs,
            limitOrder.making_amount,
            takerTraitsEncoded.trait,
            takerTraitsEncoded.args,
        );
        
        console.log('Transaction hash:', tx.hash);
        console.log('Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Order executed successfully!');
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        
    } catch (error) {
        console.log('❌ Execution failed:', error.message);
    }
}
function splitSignature(signature) {
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    
    if (sig.length !== 130) {
        throw new Error('Invalid signature length');
    }
    
    const r = '0x' + sig.slice(0, 64);
    const s = '0x' + sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);
    
    // Convert to vs format (EIP-2098 compact signature)
    // vs = s | (v - 27) << 255
    const vs = ethers.getBigInt(s) | (BigInt(v - 27) << 255n);
    
    return {
        r: r,
        vs: '0x' + vs.toString(16).padStart(64, '0')
    };
}

function calculateRequiredETH(orderData, fillAmount) {
// Check if taker asset is ETH (zero address)
if (orderData.taker_asset === ethers.ZeroAddress) {
    // We need to send ETH equal to the taking amount
    return BigInt(fillAmount);
}
return 0n;
}


// Run the execution
console.log('Starting ERC721 Limit Order Execution on Base Sepolia...');
executeOrder().catch(console.error);