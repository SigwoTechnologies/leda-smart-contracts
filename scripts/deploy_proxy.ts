// scripts/1.deploy_box.ts
import { ethers } from "hardhat"
import { upgrades } from "hardhat"

async function main() {

    const [owner] = await ethers.getSigners();
    console.log("\n");
    console.log("Deploying Box...");

    const LedaNFT = await ethers.getContractFactory("LedaNFT");
    const ledaNft = await LedaNFT.deploy("Leda NFT", "LEDA");

    console.log("\nLeda NFT contracts");
    console.log(ledaNft.address, " Leda NFTs contract address");

    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplaceFee = 50;
    
    const proxy = await upgrades.deployProxy( 
          Marketplace, 
          [marketplaceFee], 
          {
            initializer: 'initialize', 
            pollingInterval: 3000,
            useDeployedImplementation: false,
            timeout: 100000,
            kind: 'uups'
          });
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address);
    
    // Save copies of each contracts abi and address to the frontend.
    saveFrontendFiles(ledaNft , "LedaNFT");
    saveFrontendFiles(proxy , "Marketplace");
    saveImplementationAddress(implementationAddress, "Implementation");
    
    console.log("\nMarketplace proxy contracts: ");
    console.log(proxy.address," Marketplace (proxy) address");
    console.log(implementationAddress," getImplementationAddress");
    console.log("\n");
}

function saveFrontendFiles(contract:any, name:string) {
  const fs = require("fs");
  const hre = require('hardhat');

  const contractsDir = __dirname + "/../data";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = hre.artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  ); 
}

function saveImplementationAddress(implementation:any, name:string) {
  const fs = require("fs");
  const hre = require('hardhat');

  const contractsDir = __dirname + "/../data";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: implementation }, undefined, 2)
  );
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
});