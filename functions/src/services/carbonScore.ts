/**
 * Carbon Score Computation Service
 * Formula: carbonScore = areaHectares * 2.5 * ndviNormalizedFactor
 * ndviNormalizedFactor maps raw NDVI (0.0 to 1.0) linearly to a realistic 0.5–1.3 range:
 * ndviNormalizedFactor = 0.5 + (clamp(rawNdvi, 0, 1) * 0.8)
 */

export interface CarbonScoreResult {
  ndviNormalizedFactor: number;
  carbonScore: number;
  formula: string;
}

export function computeCarbonScore(areaHectares: number, rawNdvi: number): CarbonScoreResult {
  const clampedNdvi = Math.max(0, Math.min(1, rawNdvi));
  const ndviNormalizedFactor = Number((0.50 + clampedNdvi * 0.80).toFixed(2));
  const carbonScore = Number((areaHectares * 2.5 * ndviNormalizedFactor).toFixed(2));

  return {
    ndviNormalizedFactor,
    carbonScore,
    formula: "carbonScore = areaHectares * 2.5 * (0.50 + clamp(rawNdvi, 0, 1) * 0.80)"
  };
}
