import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';

describe('CarbonMitra API Integration Tests', () => {
  let createdLandId: string;
  let createdEstimateId: string;
  let createdCreditId: string;

  it('GET /api/health - should return healthy status and check details', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(res.body.checks).toBeDefined();
    expect(res.body.checks.sentinelHubApi).toBeDefined();
    expect(res.body.checks.polygonAmoyRpc).toBeDefined();
  });

  it('GET /api/lands - should list initial seed farmlands', async () => {
    const res = await request(app).get('/api/lands');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.lands)).toBe(true);
    expect(res.body.lands.length).toBeGreaterThan(0);
  });

  it('POST /api/registerLand - should register a new farmland plot with polygon GPS coordinates', async () => {
    const landPayload = {
      farmerName: 'Ramesh Patel',
      landName: 'Green Valley Plot 101',
      locationStr: 'Anand, Gujarat',
      cropType: 'Cotton',
      polygonCoords: [
        { lat: 22.5645, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9301 },
        { lat: 22.5645, lng: 72.9301 }
      ]
    };

    const res = await request(app)
      .post('/api/registerLand')
      .send(landPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.land).toBeDefined();
    expect(res.body.land.id).toBeDefined();
    expect(res.body.land.landName).toBe('Green Valley Plot 101');
    expect(res.body.land.areaHectares).toBeGreaterThan(0);

    createdLandId = res.body.land.id;
  });

  it('POST /api/fetchNDVI - should analyze satellite imagery and calculate NDVI & carbon score', async () => {
    const payload = {
      landId: createdLandId,
      polygonCoordinates: [
        { lat: 22.5645, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9301 },
        { lat: 22.5645, lng: 72.9301 }
      ]
    };

    const res = await request(app)
      .post('/api/fetchNDVI')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.estimate).toBeDefined();
    expect(res.body.estimate.ndviValue).toBeGreaterThanOrEqual(0.1);
    expect(res.body.estimate.carbonScore).toBeGreaterThan(0);
    expect(res.body.estimate.sentinelHubRequestId).toBeDefined();
    expect(res.body.rateLimitRemaining).toBeGreaterThanOrEqual(0);

    createdEstimateId = res.body.estimate.id;
  });

  it('POST /api/fetchNDVI - should utilize 30-day cache on immediate duplicate request', async () => {
    const payload = {
      landId: createdLandId,
      polygonCoordinates: [
        { lat: 22.5645, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9289 },
        { lat: 22.5655, lng: 72.9301 },
        { lat: 22.5645, lng: 72.9301 }
      ]
    };

    const res = await request(app)
      .post('/api/fetchNDVI')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isCached).toBe(true);
  });

  it('POST /api/computeCarbonScore - should compute standalone carbon score correctly', async () => {
    const res = await request(app)
      .post('/api/computeCarbonScore')
      .send({ areaHectares: 3.5, rawNdvi: 0.80 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ndviNormalizedFactor).toBe(1.14);
    expect(res.body.carbonScore).toBe(9.98); // 3.5 * 2.5 * 1.14
  });

  it('POST /api/mintCredit - should mint a Carbon Credit token on Polygon Amoy', async () => {
    const mintPayload = {
      landId: createdLandId,
      ownerUid: 'farmer-ramesh',
      farmerName: 'Ramesh Patel',
      landName: 'Green Valley Plot 101',
      locationStr: 'Anand, Gujarat',
      cropType: 'Cotton',
      amount: 10,
      ndviScore: 0.78,
      sentinelHubRequestId: 'sh-req-test-12345',
      carbonEstimateId: createdEstimateId || 'est-test-123',
      pricePerTonINR: 2400
    };

    const res = await request(app)
      .post('/api/mintCredit')
      .send(mintPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.credit).toBeDefined();
    expect(res.body.credit.status).toBe('minted');
    expect(res.body.credit.contractTokenId).toBeDefined();
    expect(res.body.credit.mintTxHash).toBeDefined();
    expect(res.body.credit.polygonScanUrl).toContain('amoy.polygonscan.com');

    createdCreditId = res.body.credit.id;
  });

  it('POST /api/marketplace/list - should list minted credit on the marketplace', async () => {
    const res = await request(app)
      .post('/api/marketplace/list')
      .send({ creditId: createdCreditId, pricePerTonINR: 2500 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.credit.status).toBe('listed');
    expect(res.body.credit.pricePerTonINR).toBe(2500);
  });

  it('POST /api/marketplace/buy - should purchase credit and record atomic transaction', async () => {
    const res = await request(app)
      .post('/api/marketplace/buy')
      .send({
        creditId: createdCreditId,
        buyerUid: 'corporate-esg-fund',
        buyerName: 'Tata Climate Impact Fund',
        buyerWalletAddress: '0x3C44CdD05aB5001A5429292a0e28a573a4b087a3'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.credit.status).toBe('sold');
    expect(res.body.credit.buyerName).toBe('Tata Climate Impact Fund');
    expect(res.body.transaction).toBeDefined();
    expect(res.body.transaction.txHash).toBeDefined();
    expect(res.body.assignedNonce).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/marketplace/buy - should reject double purchase on already sold token', async () => {
    const res = await request(app)
      .post('/api/marketplace/buy')
      .send({
        creditId: createdCreditId,
        buyerUid: 'another-buyer',
        buyerName: 'Second Buyer'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already been purchased');
  });
});
