export type UserRole = "farmer" | "buyer" | "auditor";

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  walletAddress?: string;
  createdAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Land {
  id: string;
  ownerUid: string;
  farmerName: string;
  landName: string;
  state: string;
  district: string;
  primaryCrop: string;
  soilType: string;
  practiceType: "Agroforestry" | "No-Till Farming" | "Cover Cropping" | "Organic Farming" | "Integrated Pest Mgmt";
  polygonCoordinates: GeoPoint[];
  areaHectares: number;
  registeredAt: string;
  lastNdviScore?: number;
}

export interface CarbonEstimate {
  id: string;
  landId: string;
  ndviValue: number;
  ndviNormalizedFactor: number;
  carbonScore: number; // In Metric Tons of CO2e per year
  computedAt: string;
  sentinelHubRequestId: string;
  dataSource?: "fresh-sentinel-api" | "in-memory-cache" | "firestore-30day-cache" | string;
  rateLimitRemaining?: number;
  auditDetails: {
    rawB04_Red: number;
    rawB08_NIR: number;
    formulaUsed: string;
    satellitePassDate: string;
    cloudCoverPercent: number;
    satelliteSensor: string;
  };
}

export interface CarbonCredit {
  id: string;
  landId: string;
  ownerUid: string;
  farmerName: string;
  landName: string;
  locationStr: string;
  cropType: string;
  amount: number; // Metric Tons of CO2e
  pricePerTonINR: number;
  totalPriceINR: number;
  // Legacy optional fallback properties
  pricePerTonUSD?: number;
  totalPriceUSD?: number;
  status: "minted" | "listed" | "sold";
  contractTokenId: string;
  mintTxHash: string;
  createdAt: string;
  listedAt?: string;
  soldAt?: string;
  buyerUid?: string;
  buyerName?: string;
  transferTxHash?: string;
  ndviScore: number;
  sentinelHubRequestId: string;
}

export interface TransactionRecord {
  id: string;
  creditId: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  amount: number;
  priceINR: number;
  priceUSD?: number;
  txHash: string;
  timestamp: string;
  polygonScanUrl: string;
  tokenId: string;
}

export interface PresetRegion {
  id: string;
  name: string;
  district: string;
  state: string;
  crop: string;
  center: [number, number];
  samplePolygon: [number, number][];
  defaultNdvi: number;
}

export interface AgronomicInsight {
  landId: string;
  healthAssessment: string;
  carbonPotential: string;
  recommendations: string[];
  estimatedSequestrationGain: number; // percentage gain
}
