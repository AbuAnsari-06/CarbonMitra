import { apiFetch } from './api';
import { Land, CarbonEstimate } from '../types';

export interface RegisterLandInput {
  farmerName: string;
  landName: string;
  locationStr: string;
  cropType: string;
  polygonCoords: { lat: number; lng: number }[];
  ownerUid?: string;
}

export interface FetchNdviInput {
  landId: string;
  polygonCoords: { lat: number; lng: number }[];
  farmerId?: string;
}

export interface ComputeCarbonInput {
  areaHectares: number;
  rawNdvi: number;
}

export const landService = {
  /**
   * Fetch all registered farmlands.
   */
  getLands: async (): Promise<{ success: boolean; lands: Land[] }> => {
    return apiFetch<{ success: boolean; lands: Land[] }>('/api/lands');
  },

  /**
   * Register a new farmland plot with GPS polygon coordinates.
   */
  registerLand: async (input: RegisterLandInput): Promise<{ success: boolean; land: Land }> => {
    return apiFetch<{ success: boolean; land: Land }>('/api/registerLand', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  /**
   * Fetch Sentinel-2 satellite imagery and calculate live NDVI & carbon sequestration.
   */
  fetchNDVI: async (input: FetchNdviInput): Promise<{ success: boolean; estimate: CarbonEstimate; isCached?: boolean }> => {
    return apiFetch<{ success: boolean; estimate: CarbonEstimate; isCached?: boolean }>('/api/fetchNDVI', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  /**
   * Compute carbon score given area in hectares and raw NDVI value.
   */
  computeCarbonScore: async (input: ComputeCarbonInput): Promise<{ success: boolean; carbonScore: number; ndviNormalizedFactor: number }> => {
    return apiFetch<{ success: boolean; carbonScore: number; ndviNormalizedFactor: number }>('/api/computeCarbonScore', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }
};
