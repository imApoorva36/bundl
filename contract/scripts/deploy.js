const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);

    // Deploy BundlExecutor (for testing and reference)
    const BundlExecutor = await ethers.getContractFactory("BundlExecutor");
    const bundlExecutor = await BundlExecutor.deploy(deployer.address, 0);
    await bundlExecutor.deployed();
    console.log(`BundlExecutor deployed to: ${bundlExecutor.address}`);

    // Deploy Registry
    const Registry = await ethers.getContractFactory("BundlRegistry");
    const registry = await Registry.deploy();
    await registry.deployed();
    console.log(`Registry deployed to: ${registry.address}`);

    // Deploy BundlCore 
    const BundlCore = await ethers.getContractFactory("BundlCore");
    const bundlCore = await BundlCore.deploy(registry.address, bundlExecutor.address);
    await bundlCore.deployed();
    console.log(`BundlCore deployed to: ${bundlCore.address}`);

    // Predicate already deployed
    const predicateAddress = "0xc405b2d27680038fBa522A0b5e037De31ACC6e18";
    console.log(`Predicate already deployed at: ${predicateAddress}`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });