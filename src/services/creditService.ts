import { apiFetch } from './api';
import { CarbonCredit, TransactionRecord } from '../types';

export interface MintCreditInput {
  landId: string;
  ownerUid: string;
  farmerName: string;
  landName: string;
  locationStr: string;
  cropType: string;
  amount: number;
  ndviScore: number;
  sentinelHubRequestId: string;
  carbonEstimateId: string;
  pricePerTonINR?: number;
  pricePerTonUSD?: number;
}

export interface ListCreditInput {
  creditId: string;
  pricePerTonINR?: number;
  pricePerTonUSD?: number;
}

export interface BuyCreditInput {
  creditId: string;
  buyerUid?: string;
  buyerName?: string;
  buyerWalletAddress?: string;
}

export const creditService = {
  /**
   * Fetch all carbon credits.
   */
  getCredits: async (): Promise<{ success: boolean; credits: CarbonCredit[] }> => {
    return apiFetch<{ success: boolean; credits: CarbonCredit[] }>('/api/marketplace/credits');
  },

  /**
   * Fetch all transaction history records.
   */
  getTransactions: async (): Promise<{ success: boolean; transactions: TransactionRecord[] }> => {
    return apiFetch<{ success: boolean; transactions: TransactionRecord[] }>('/api/transactions');
  },

  /**
   * Mint carbon credit token on Polygon Amoy smart contract.
   */
  mintCredit: async (input: MintCreditInput): Promise<{ success: boolean; credit: CarbonCredit }> => {
    return apiFetch<{ success: boolean; credit: CarbonCredit }>('/api/mintCredit', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  /**
   * List carbon credit on marketplace.
   */
  listCredit: async (input: ListCreditInput): Promise<{ success: boolean; credit: CarbonCredit }> => {
    return apiFetch<{ success: boolean; credit: CarbonCredit }>('/api/marketplace/list', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  /**
   * Purchase carbon credit token on marketplace.
   */
  buyCredit: async (input: BuyCreditInput): Promise<{ success: boolean; credit: CarbonCredit; transaction: TransactionRecord }> => {
    return apiFetch<{ success: boolean; credit: CarbonCredit; transaction: TransactionRecord }>('/api/marketplace/buy', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }
};
