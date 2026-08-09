import { ethers, run } from "hardhat";

/**
 * Hardhat Deployment and Verification Script for CarbonMitra (Polygon Amoy Testnet).
 * Deploys the CarbonCreditContract, waits for block confirmations, and verifies on PolygonScan.
 */
async function main() {
  console.log("==================================================================");
  console.log("🚀 Starting CarbonMitra Smart Contract Deployment (Polygon Amoy)...");
  console.log("==================================================================");

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured. Please check BACKEND_WALLET_PRIVATE_KEY.");
  }

  const deployerAddress = await deployer.getAddress();
  const balanceWei = await ethers.provider.getBalance(deployerAddress);
  console.log(`📍 Deployer Wallet: ${deployerAddress}`);
  console.log(`💰 Wallet Balance:  ${ethers.formatEther(balanceWei)} POL / MATIC`);

  // Deploy Contract
  console.log("\n📦 Deploying CarbonCreditContract...");
  const CarbonCreditFactory = await ethers.getContractFactory("CarbonCreditContract");
  const contract = await CarbonCreditFactory.deploy();

  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log(`✅ CarbonCreditContract successfully deployed to Polygon Amoy:`);
  console.log(`👉 Contract Address: ${deployedAddress}`);
  console.log(`🔗 PolygonScan Link: https://amoy.polygonscan.com/address/${deployedAddress}`);

  // Wait 5 block confirmations for PolygonScan indexer
  console.log("\n⏳ Waiting 5 block confirmations before triggering PolygonScan verification...");
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5);
  }

  // PolygonScan Verification
  const apiKey = process.env.POLYGONSCAN_API_KEY;
  if (apiKey && apiKey !== "your_polygonscan_api_key") {
    console.log("\n🔍 Initiating Automatic PolygonScan Verification...");
    try {
      await run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [],
      });
      console.log("🎉 Contract source code successfully verified on PolygonScan Amoy!");
    } catch (verifyErr: any) {
      if (verifyErr.message?.includes("Already Verified")) {
        console.log("ℹ️ Contract source code is already verified on PolygonScan.");
      } else {
        console.warn("⚠️ PolygonScan verification error:", verifyErr.message || verifyErr);
      }
    }
  } else {
    console.log("\n💡 Skipped auto-verification: POLYGONSCAN_API_KEY not configured in .env.");
    console.log(`   To verify manually: npx hardhat verify --network polygonAmoy ${deployedAddress}`);
  }

  console.log("\n==================================================================");
  console.log("✨ Deployment complete! Copy the address into .env:");
  console.log(`CARBON_CREDIT_CONTRACT_ADDRESS="${deployedAddress}"`);
  console.log("==================================================================");
}

main().catch((error) => {
  console.error("❌ Fatal deployment error:", error);
  process.exitCode = 1;
});
