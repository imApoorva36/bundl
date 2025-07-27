require('dotenv').config();

const { LimitOrder, MakerTraits, Address, randBigInt } = require('@1inch/limit-order-sdk');
const { Wallet, Interface } = require('ethers');

const privKey = process.env.PRIVATE_KEY;
const maker = new Wallet(privKey);

async function createLimitOrder() {
  try {
    const expiresIn = 120n;
    const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
    const UINT_40_MAX = (1n << 40n) - 1n;

    const makerTraits = MakerTraits.default()
      .withExpiration(expiration)
      .withNonce(randBigInt(UINT_40_MAX));



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



    const order = new LimitOrder({
      makerAsset: new Address('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      takerAsset: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
      makingAmount: 100_000000n,
      takingAmount: 10_00000000000000000n,
      maker: new Address(maker.address),
    }, makerTraits);

    const typedData = order.getTypedData(84532); // baseSepolia Testnet

    const signature = await maker.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    const orderData = {
      order: {
        makerAsset: order.makerAsset.toString(),
        takerAsset: order.takerAsset.toString(),
        makingAmount: order.makingAmount.toString(),
        takingAmount: order.takingAmount.toString(),
        maker: order.maker.toString(),
        salt: order.salt?.toString(),
        receiver: order.receiver?.toString(),
        makerTraits: order.makerTraits.toString(),
        predicate: predicate
      },
      signature,
      orderHash: order.getOrderHash(84532),
      networkId: 84532 //baseSepolia Testnet
    };

    console.log('✅ Limit Order:', orderData);
  } catch (err) {
    console.error('❌ Failed to create limit order:', err);
  }
}

createLimitOrder();
