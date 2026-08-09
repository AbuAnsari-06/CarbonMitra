import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server';

describe('CarbonMitra End-to-End Workflow Integration Test Suite', () => {
  it('Simulates complete Farmer dMRV flow -> Satellite Fetch -> Token Minting -> Marketplace Listing -> Corporate Purchase', async () => {
    // 1. Farmer registers land plot
    const regRes = await request(app)
      .post('/api/registerLand')
      .send({
        farmerName: 'Suresh Kumar',
        landName: 'E2E Test Solar Farm',
        locationStr: 'Nashik, Maharashtra',
        cropType: 'Sugarcane',
        polygonCoords: [
          { lat: 19.9975, lng: 73.7898 },
          { lat: 19.9985, lng: 73.7898 },
          { lat: 19.9985, lng: 73.7910 },
          { lat: 19.9975, lng: 73.7910 }
        ]
      });

    expect(regRes.status).toBe(200);
    const land = regRes.body.land;
    expect(land.id).toBeDefined();

    // 2. Fetch Sentinel Satellite NDVI and Carbon Sequestration Estimate
    const ndviRes = await request(app)
      .post('/api/fetchNDVI')
      .send({
        landId: land.id,
        polygonCoordinates: land.polygonCoordinates
      });

    expect(ndviRes.status).toBe(200);
    const estimate = ndviRes.body.estimate;
    expect(estimate.carbonScore).toBeGreaterThan(0);
    expect(estimate.sentinelHubRequestId).toBeDefined();

    // 3. Mint Carbon Credit Token on Polygon Amoy Smart Contract
    const mintRes = await request(app)
      .post('/api/mintCredit')
      .send({
        landId: land.id,
        ownerUid: 'farmer-suresh',
        farmerName: land.farmerName,
        landName: land.landName,
        locationStr: land.locationStr,
        cropType: land.primaryCrop,
        amount: Math.round(estimate.carbonScore),
        ndviScore: estimate.ndviValue,
        sentinelHubRequestId: estimate.sentinelHubRequestId,
        carbonEstimateId: estimate.id,
        pricePerTonINR: 2400
      });

    expect(mintRes.status).toBe(200);
    const credit = mintRes.body.credit;
    expect(credit.status).toBe('minted');
    expect(credit.mintTxHash).toBeDefined();

    // 4. List credit on Carbon Market
    const listRes = await request(app)
      .post('/api/marketplace/list')
      .send({ creditId: credit.id, pricePerTonINR: 2600 });

    expect(listRes.status).toBe(200);
    expect(listRes.body.credit.status).toBe('listed');

    // 5. Corporate Buyer purchases credit
    const buyRes = await request(app)
      .post('/api/marketplace/buy')
      .send({
        creditId: credit.id,
        buyerUid: 'corp-buyer-e2e',
        buyerName: 'Global Green Energy Corp',
        buyerWalletAddress: '0x3C44CdD05aB5001A5429292a0e28a573a4b087a3'
      });

    expect(buyRes.status).toBe(200);
    expect(buyRes.body.credit.status).toBe('sold');
    expect(buyRes.body.transaction.txHash).toBeDefined();

    // 6. Verify Transaction is present in overall transactions ledger
    const txListRes = await request(app).get('/api/transactions');
    expect(txListRes.status).toBe(200);
    const foundTx = txListRes.body.transactions.find((t: any) => t.id === buyRes.body.transaction.id);
    expect(foundTx).toBeDefined();
    expect(foundTx.toName).toBe('Global Green Energy Corp');
  });
});
