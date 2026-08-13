// Hardhat configuration for deploying CarbonMitra smart contract to Polygon Amoy Testnet
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const rawKey = process.env.BACKEND_WALLET_PRIVATE_KEY || "";
const isValidKey = /^0x[a-fA-F0-9]{64}$/.test(rawKey);
const PRIVATE_KEY = isValidKey
  ? rawKey
  : "0x1111111111111111111111111111111111111111111111111111111111111111";

export default {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./tests/contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
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
