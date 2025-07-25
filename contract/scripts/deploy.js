const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contract with account: ${deployer.address}`);

    const currentTime = Math.floor(Date.now() / 1000); // current UNIX timestamp in seconds
    const unlockTime = currentTime + 7 * 24 * 60 * 60; // 1 week later

    const contractFactory = await ethers.getContractFactory("Lock");
    const deployedContract = await contractFactory.deploy(unlockTime);

    await deployedContract.deployed();
    console.log(`Contract deployed to: ${deployedContract.address}`);
    console.log(`Unlock time is: ${unlockTime}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
