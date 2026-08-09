import { apiFetch } from './api';

export interface AiAnalysisInput {
  landName: string;
  cropType: string;
  areaHectares: number;
  ndviScore: number;
  carbonScore: number;
}

export const aiService = {
  /**
   * Perform Gemini AI agronomic & carbon market analysis on farmland.
   */
  analyzeLand: async (input: AiAnalysisInput): Promise<{ success: boolean; analysis: string }> => {
    return apiFetch<{ success: boolean; analysis: string }>('/api/ai/analyze-land', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }
};
