/**
 * Smart Contract Configuration & ABI definitions for Polygon Amoy Testnet.
 * Loaded dynamically from environment variables.
 */

export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CARBON_CREDIT_CONTRACT_ADDRESS as string) ||
  "0x948123A1B2C3D4e5f6A7B8C9D0E1f2A3B4C5D6E7";

export const POLYGON_SCAN_AMOY_BASE =
  (import.meta.env.VITE_POLYGON_SCAN_AMOY_BASE as string) ||
  "https://amoy.polygonscan.com";

export const CARBON_CREDIT_ABI = [
  "function mintCredit(address farmer, uint256 amountInTons, string landId, string carbonEstimateId, string sentinelRequestId) external returns (uint256)",
  "function transferCredit(uint256 tokenId, address toBuyer, uint256 priceInUsdCents) external returns (bool)",
  "function getCreditDetails(uint256 tokenId) external view returns (tuple(uint256 tokenId, address farmer, address currentOwner, uint256 amountInTons, string landId, string carbonEstimateId, string sentinelRequestId, uint256 mintedAt, bool isListed, uint256 priceInUsdCents))",
  "function getOwnerTokens(address owner) external view returns (uint256[])",
  "event CarbonCreditMinted(uint256 indexed tokenId, address indexed farmer, address indexed currentOwner, uint256 amountInTons, string landId, string carbonEstimateId, string sentinelRequestId)",
  "event CarbonCreditTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 priceInUsdCents, uint256 timestamp)"
];
