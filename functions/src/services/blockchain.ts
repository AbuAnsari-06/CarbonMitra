import { JsonRpcProvider, Wallet, Contract, isAddress } from "ethers";
import { validateAndGetConfig, getBackendWalletPrivateKey } from "../config";
import { withAtomicNonce } from "../utils/nonceManager";
import { CARBON_CREDIT_ABI } from "../../../src/lib/contract";

export interface MintCreditParams {
  farmer: string;
  amountInTons: number;
  landId: string;
  carbonEstimateId: string;
  sentinelRequestId: string;
}

export interface TransferCreditParams {
  tokenId: number | string;
  toBuyer: string;
  priceInUsdCents: number;
}

export interface BlockchainTxResult {
  txHash: string;
  assignedNonce: number;
  contractTokenId?: string;
  contractAddress: string;
  polygonScanUrl: string;
  isSimulated: boolean;
  simulationMode?: string;
  params: MintCreditParams | TransferCreditParams;
}

/**
 * Service for minting Carbon Credit tokens on Polygon Amoy.
 * Uses ethers.js if a real private key is configured (BACKEND_WALLET_PRIVATE_KEY / Secret Manager).
 * Fallbacks to an explicit, clearly-labeled simulation path if not configured.
 */
export async function mintCarbonCreditOnChain(params: MintCreditParams): Promise<BlockchainTxResult> {
  const config = validateAndGetConfig();
  const signerPrivateKey = await getBackendWalletPrivateKey();

  const isRealKeyConfigured =
    signerPrivateKey &&
    signerPrivateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
    process.env.NODE_ENV !== "test" &&
    !process.env.VITEST;

  if (isRealKeyConfigured) {
    const provider = new JsonRpcProvider(config.polygonAmoyRpcUrl);
    const wallet = new Wallet(signerPrivateKey, provider);
    const contract = new Contract(config.carbonCreditContractAddress, CARBON_CREDIT_ABI, wallet);

    const farmerAddress = isAddress(params.farmer) ? params.farmer : wallet.address;
    const scaledAmount = Math.round(params.amountInTons * 100);

    return withAtomicNonce(
      wallet.address,
      async () => provider.getTransactionCount(wallet.address, "pending"),
      async (assignedNonce) => {
        const tx = await contract.mintCredit(
          farmerAddress,
          scaledAmount,
          params.landId,
          params.carbonEstimateId,
          params.sentinelRequestId,
          { nonce: assignedNonce }
        );
        const receipt = await tx.wait();
        const txHash = receipt.hash || tx.hash;

        return {
          txHash,
          assignedNonce,
          contractTokenId: receipt.logs?.[0]?.topics?.[1]
            ? BigInt(receipt.logs[0].topics[1]).toString()
            : undefined,
          contractAddress: config.carbonCreditContractAddress,
          polygonScanUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
          isSimulated: false,
          params
        };
      }
    );
  } else {
    // Explicit, clearly-labeled simulation path
    const backendWalletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    return withAtomicNonce(
      backendWalletAddress,
      async () => Math.floor(Date.now() / 1000),
      async (assignedNonce) => {
        const chars = "0123456789abcdef";
        let hex = "";
        for (let i = 0; i < 64; i++) {
          hex += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const txHash = "0xSIMULATED_" + hex;
        const contractTokenId = String(Math.floor(1000 + Math.random() * 9000));

        return {
          txHash,
          assignedNonce,
          contractTokenId,
          contractAddress: config.carbonCreditContractAddress,
          polygonScanUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
          isSimulated: true,
          simulationMode: "SIMULATED_TESTNET_RELAY",
          params
        };
      }
    );
  }
}

/**
 * Service for transferring Carbon Credit tokens on Polygon Amoy.
 * Uses ethers.js if a real private key is configured (BACKEND_WALLET_PRIVATE_KEY / Secret Manager).
 * Fallbacks to an explicit, clearly-labeled simulation path if not configured.
 */
export async function transferCarbonCreditOnChain(params: TransferCreditParams): Promise<BlockchainTxResult> {
  const config = validateAndGetConfig();
  const signerPrivateKey = await getBackendWalletPrivateKey();

  const isRealKeyConfigured =
    signerPrivateKey &&
    signerPrivateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
    process.env.NODE_ENV !== "test" &&
    !process.env.VITEST;

  if (isRealKeyConfigured) {
    const provider = new JsonRpcProvider(config.polygonAmoyRpcUrl);
    const wallet = new Wallet(signerPrivateKey, provider);
    const contract = new Contract(config.carbonCreditContractAddress, CARBON_CREDIT_ABI, wallet);

    const buyerAddress = isAddress(params.toBuyer) ? params.toBuyer : "0x3C44CdD05aB5001A5429292a0e28a573a4b087a3";
    const numericTokenId = BigInt(params.tokenId);
    const scaledPrice = Math.round(params.priceInUsdCents);

    return withAtomicNonce(
      wallet.address,
      async () => provider.getTransactionCount(wallet.address, "pending"),
      async (assignedNonce) => {
        const tx = await contract.transferCredit(
          numericTokenId,
          buyerAddress,
          scaledPrice,
          { nonce: assignedNonce }
        );
        const receipt = await tx.wait();
        const txHash = receipt.hash || tx.hash;

        return {
          txHash,
          assignedNonce,
          contractAddress: config.carbonCreditContractAddress,
          polygonScanUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
          isSimulated: false,
          params
        };
      }
    );
  } else {
    // Explicit, clearly-labeled simulation path
    const backendWalletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    return withAtomicNonce(
      backendWalletAddress,
      async () => Math.floor(Date.now() / 1000),
      async (assignedNonce) => {
        const chars = "0123456789abcdef";
        let hex = "";
        for (let i = 0; i < 64; i++) {
          hex += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const txHash = "0xSIMULATED_" + hex;

        return {
          txHash,
          assignedNonce,
          contractAddress: config.carbonCreditContractAddress,
          polygonScanUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
          isSimulated: true,
          simulationMode: "SIMULATED_TESTNET_RELAY",
          params
        };
      }
    );
  }
}

