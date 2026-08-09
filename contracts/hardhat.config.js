// Hardhat configuration for deploying CarbonMitra smart contract to Polygon Amoy Testnet
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygonAmoy: {
      url: POLYGON_AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
