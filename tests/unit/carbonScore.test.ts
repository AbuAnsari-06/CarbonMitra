import { describe, it, expect } from 'vitest';
import { computeCarbonScore } from '../../functions/src/services/carbonScore';

describe('Carbon Score & NDVI Factor Unit Tests', () => {
  it('should compute correct ndviNormalizedFactor and carbonScore for baseline NDVI 0.72', () => {
    const area = 2.5; // hectares
    const rawNdvi = 0.72;

    const result = computeCarbonScore(area, rawNdvi);

    // Expected factor: 0.50 + (0.72 * 0.80) = 0.50 + 0.576 = 1.076 -> rounded to 1.08
    expect(result.ndviNormalizedFactor).toBe(1.08);

    // Expected score: 2.5 * 2.5 * 1.08 = 6.75
    expect(result.carbonScore).toBe(6.75);
    expect(result.formula).toContain('carbonScore = areaHectares * 2.5');
  });

  it('should correctly handle minimum NDVI (0.0)', () => {
    const area = 1.0;
    const rawNdvi = 0.0;

    const result = computeCarbonScore(area, rawNdvi);

    // Factor: 0.50 + (0.0 * 0.80) = 0.50
    expect(result.ndviNormalizedFactor).toBe(0.50);
    // Carbon Score: 1.0 * 2.5 * 0.50 = 1.25
    expect(result.carbonScore).toBe(1.25);
  });

  it('should correctly handle maximum healthy NDVI (1.0)', () => {
    const area = 4.0;
    const rawNdvi = 1.0;

    const result = computeCarbonScore(area, rawNdvi);

    // Factor: 0.50 + (1.0 * 0.80) = 1.30
    expect(result.ndviNormalizedFactor).toBe(1.30);
    // Carbon Score: 4.0 * 2.5 * 1.30 = 13.0
    expect(result.carbonScore).toBe(13.0);
  });

  it('should clamp negative NDVI values to 0.0', () => {
    const area = 2.0;
    const rawNdvi = -0.5; // Water or non-vegetated

    const result = computeCarbonScore(area, rawNdvi);

    expect(result.ndviNormalizedFactor).toBe(0.50);
    expect(result.carbonScore).toBe(2.5); // 2.0 * 2.5 * 0.50
  });

  it('should clamp out-of-bounds high NDVI values to 1.0', () => {
    const area = 3.0;
    const rawNdvi = 1.8;

    const result = computeCarbonScore(area, rawNdvi);

    expect(result.ndviNormalizedFactor).toBe(1.30);
    expect(result.carbonScore).toBe(9.75); // 3.0 * 2.5 * 1.30
  });

  it('should scale carbon score linearly with land area', () => {
    const rawNdvi = 0.60; // Factor = 0.50 + (0.60 * 0.80) = 0.98

    const resultSmall = computeCarbonScore(1.0, rawNdvi);
    const resultLarge = computeCarbonScore(10.0, rawNdvi);

    expect(resultSmall.ndviNormalizedFactor).toBe(0.98);
    expect(resultLarge.ndviNormalizedFactor).toBe(0.98);

    expect(resultSmall.carbonScore).toBe(2.45); // 1.0 * 2.5 * 0.98
    expect(resultLarge.carbonScore).toBe(24.5); // 10.0 * 2.5 * 0.98
  });
});
