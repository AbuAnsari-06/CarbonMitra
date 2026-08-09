const hre = require("hardhat");

/**
 * Hardhat Deployment and PolygonScan Verification Script for CarbonMitra (Polygon Amoy Testnet).
 * Deploys CarbonCreditContract, waits 5 block confirmations, and verifies source code on PolygonScan.
 */
async function main() {
  console.log("==================================================================");
  console.log("🚀 Starting CarbonMitra Smart Contract Deployment (Polygon Amoy)...");
  console.log("==================================================================");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer wallet configured. Please check BACKEND_WALLET_PRIVATE_KEY.");
  }

  const deployerAddress = await deployer.getAddress();
  const balanceWei = await hre.ethers.provider.getBalance(deployerAddress);
  console.log(`📍 Deployer Wallet: ${deployerAddress}`);
  console.log(`💰 Wallet Balance:  ${hre.ethers.formatEther(balanceWei)} POL / MATIC`);

  // Deploy CarbonCreditContract
  console.log("\n📦 Deploying CarbonCreditContract...");
  const CarbonCreditFactory = await hre.ethers.getContractFactory("CarbonCreditContract");
  const contract = await CarbonCreditFactory.deploy();

  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log(`✅ CarbonCreditContract successfully deployed to Polygon Amoy:`);
  console.log(`👉 Contract Address: ${deployedAddress}`);
  console.log(`🔗 PolygonScan Link: https://amoy.polygonscan.com/address/${deployedAddress}`);

  // Wait 5 block confirmations for PolygonScan indexer synchronization
  console.log("\n⏳ Waiting 5 block confirmations before triggering PolygonScan verification...");
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5);
  }

  // PolygonScan Automatic Source Code Verification
  const apiKey = process.env.POLYGONSCAN_API_KEY;
  if (apiKey && apiKey !== "your_polygonscan_api_key") {
    console.log("\n🔍 Initiating Automatic PolygonScan Verification...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [],
      });
      console.log("🎉 Contract source code successfully verified on PolygonScan Amoy!");
    } catch (verifyErr) {
      if (verifyErr.message && verifyErr.message.includes("Already Verified")) {
        console.log("ℹ️ Contract source code is already verified on PolygonScan.");
      } else {
        console.warn("⚠️ PolygonScan verification warning:", verifyErr.message || verifyErr);
      }
    }
  } else {
    console.log("\n💡 Skipped auto-verification: POLYGONSCAN_API_KEY not set in .env.");
    console.log(`   To verify manually run: npx hardhat verify --network polygonAmoy ${deployedAddress}`);
  }

  console.log("\n==================================================================");
  console.log("✨ Deployment complete! Set the environment variable:");
  console.log(`CARBON_CREDIT_CONTRACT_ADDRESS="${deployedAddress}"`);
  console.log("==================================================================");
}

main().catch((error) => {
  console.error("❌ Fatal deployment error:", error);
  process.exitCode = 1;
});
