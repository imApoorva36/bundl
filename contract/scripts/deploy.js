const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🚀 Deploying with: ${deployer.address}`);

    // Deploy BundlExecutor (wallet logic)
    const Executor = await ethers.getContractFactory("BundlExecutor");
    const executor = await Executor.deploy(deployer.address, 0); // dummy args
    await executor.deployed();
    console.log(`✅ Wallet logic deployed at: ${executor.address}`);

    // Deploy registry
    const Registry = await ethers.getContractFactory("BundlRegistry");
    const registry = await Registry.deploy();
    await registry.deployed();
    console.log(`✅ Registry deployed at: ${registry.address}`);

    // Deploy BundlCore
    const Bundl = await ethers.getContractFactory("BundlCore");
    const bundl = await Bundl.deploy(registry.address, executor.address);
    await bundl.deployed();
    console.log(`✅ BundlCore deployed at: ${bundl.address}`);
}

main().catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
});
