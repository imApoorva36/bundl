const { ethers } = require("hardhat");

async function main() {
  const limitOrderProtocolAddress = "0x111111125421ca6dc452d289314280a0f8842a65";

  console.log("Deploying ERC721Proxy...");
  console.log("Immutable Owner (Limit Order Protocol):", limitOrderProtocolAddress);

  const ERC721Proxy = await ethers.getContractFactory("ERC721Proxy");
  const erc721Proxy = await ERC721Proxy.deploy(limitOrderProtocolAddress);
  await erc721Proxy.deployed(); // <- wait for deployment

  const proxyAddress = erc721Proxy.address;
  console.log("ERC721Proxy deployed to:", proxyAddress);

  const expectedSelector = "0x23b872dd"; // IERC20.transferFrom selector
  console.log("Expected selector:", expectedSelector);

  const iface = new ethers.utils.Interface([
    "function func_60iHVgK(address,address,uint256,uint256,address)"
  ]);
  const actualSelector = iface.getFunction("func_60iHVgK").selector;
  console.log("Actual selector:", actualSelector);
  console.log("Selectors match:", expectedSelector === actualSelector);

  return proxyAddress;
}

main()
  .then((address) => {
    console.log(`\nDeployment successful! Use this address in your code:`);
    console.log(`const erc721ProxyAddress = "${address}";`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
