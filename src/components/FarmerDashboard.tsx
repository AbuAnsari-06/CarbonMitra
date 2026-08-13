import React, { useState } from 'react';
import { LandMap } from './LandMap';
import { GeoPoint, Land, CarbonEstimate, CarbonCredit, PresetRegion } from '../types';
import { PRESET_REGIONS, POLYGON_SCAN_AMOY_BASE } from '../data/presets';
import { 
  Sprout, Satellite, ShieldCheck, Coins, Plus, ExternalLink, 
  Sparkles, ArrowUpRight, CheckCircle2, Clock, 
  MapPin, AlertCircle, FileText, BarChart3, TrendingUp, RefreshCw, ChevronRight, Activity, Radar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  PolygonProcessingSteps, ProcessingStep, 
  EmptyState, ErrorState, SkeletonMetrics, SkeletonCard, RefetchButton 
} from './CommonUI';
import { triggerToast } from '../lib/uiUtils';
import { APPROX_INR_PER_USD } from '../lib/constants';

interface FarmerDashboardProps {
  farmerName: string;
  lands: Land[];
  credits: CarbonCredit[];
  onRegisterLand: (landData: any) => Promise<Land>;
  onFetchNDVI: (landId: string, coords: GeoPoint[]) => Promise<CarbonEstimate>;
  onMintCredit: (creditData: any) => Promise<any>;
  onListCredit: (creditId: string, pricePerTon: number) => Promise<void>;
  onOpenExplorer: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmerName,
  lands,
  credits,
  onRegisterLand,
  onFetchNDVI,
  onMintCredit,
  onListCredit,
  onOpenExplorer
}) => {
  // Global & Refresh States
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<{ message: string; code?: string } | null>(null);

  // Modal & Selection States
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [selectedLandId, setSelectedLandId] = useState<string>(lands[0]?.id || '');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  
  // Registration Form State
  const [landName, setLandName] = useState<string>('');
  const [primaryCrop, setPrimaryCrop] = useState<string>('Paddy Rice & Black Gram');
  const [soilType, setSoilType] = useState<string>('Alluvial Clay');
  const [practiceType, setPracticeType] = useState<Land['practiceType']>('Agroforestry');
  const [polygonCoords, setPolygonCoords] = useState<GeoPoint[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PresetRegion | null>(null);

  // Open modal with clean initial values and reset map
  const openRegistrationModal = () => {
    setSelectedPreset(null);
    setPrimaryCrop('Paddy Rice & Black Gram');
    setSoilType('Alluvial Clay');
    setPracticeType('Agroforestry');
    setLandName('');
    setPolygonCoords([]);
    setIsRegistering(true);
  };

  // Satellite Scanning & Estimate State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<ProcessingStep>('calculating_area');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentEstimate, setCurrentEstimate] = useState<CarbonEstimate | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState<string | null>(null);
  
  // Minting State
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintResult, setMintResult] = useState<any | null>(null);

  // Listing State
  const [listingPriceMap, setListingPriceMap] = useState<Record<string, number>>({});
  const [listingLoadingMap, setListingLoadingMap] = useState<Record<string, boolean>>({});

  // Active Selected Farmland
  const currentLand = lands.find(l => l.id === selectedLandId) || lands[0];
  
  // Aggregate Metrics
  const totalLandArea = lands.reduce((acc, l) => acc + l.areaHectares, 0);
  const totalCreditsMinted = credits.reduce((acc, c) => acc + c.amount, 0);
  const totalEarningsINR = credits
    .filter(c => c.status === 'sold')
    .reduce((acc, c) => acc + (c.totalPriceINR || (c.totalPriceUSD ? c.totalPriceUSD * APPROX_INR_PER_USD : 0)), 0);

  // Refresh Farmland Data Simulation
  const handleRefetch = async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      triggerToast('info', 'Farmland records and credit ledger successfully synchronized.');
    } catch (err: any) {
      setFetchError({ message: err.message || 'Failed to re-sync farmland data.', code: 'SYNC_ERROR' });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle Land Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landName.trim()) {
      triggerToast('error', 'Farmland name is mandatory. Please enter a plot name.');
      return;
    }
    if (polygonCoords.length < 3) {
      triggerToast('error', 'Please set at least 3 GPS boundary pins on the map to define your farmland.');
      return;
    }

    setIsGeocoding(true);
    let detectedState = 'Tamil Nadu';
    let detectedDistrict = 'Thanjavur';

    try {
      // Auto-detect location from polygon centroid coordinates
      const avgLat = polygonCoords.reduce((s, p) => s + p.lat, 0) / polygonCoords.length;
      const avgLng = polygonCoords.reduce((s, p) => s + p.lng, 0) / polygonCoords.length;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${avgLat.toFixed(5)}&lon=${avgLng.toFixed(5)}&zoom=10`);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const foundDistrict = addr.county || addr.state_district || addr.city || addr.town || addr.district || addr.suburb;
          const foundState = addr.state || addr.region;

          if (foundDistrict) detectedDistrict = foundDistrict;
          if (foundState) detectedState = foundState;
        }
      } catch (geoErr) {
        console.warn("Geocoding reverse lookup warning:", geoErr);
      }

      // Manual or auto-generated land name
      const finalLandName = landName.trim() || `${detectedDistrict} Green Plot #${lands.length + 1}`;

      const newLand = await onRegisterLand({
        ownerUid: 'farmer-01',
        farmerName,
        landName: finalLandName,
        state: detectedState,
        district: detectedDistrict,
        primaryCrop,
        soilType,
        practiceType,
        polygonCoordinates: polygonCoords
      });

      setIsRegistering(false);
      setSelectedLandId(newLand.id);
      triggerToast('success', `Farmland "${finalLandName}" (${detectedDistrict}, ${detectedState}) registered successfully!`);

      // Auto trigger satellite scan
      handleTriggerSatelliteScan(newLand);
    } catch (err: any) {
      triggerToast('error', 'Registration failed: ' + err.message, err.errorCode);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Trigger Sentinel-2 Satellite Scan with Step Progress Indicator
  const handleTriggerSatelliteScan = async (landObj?: Land) => {
    const target = landObj || currentLand;
    if (!target) return;

    setIsScanning(true);
    setCurrentEstimate(null);
    setMintResult(null);

    // Step 1: Calculating Area
    setScanStep('calculating_area');
    setScanProgress(25);
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Fetching NDVI
    setScanStep('fetching_ndvi');
    setScanProgress(60);

    try {
      setQuotaExceeded(false);
      setQuotaErrorMessage(null);
      const est = await onFetchNDVI(target.id, target.polygonCoordinates);

      // Step 3: Computing Score
      setScanStep('computing_score');
      setScanProgress(90);
      await new Promise(r => setTimeout(r, 300));

      setScanStep('completed');
      setScanProgress(100);
      setCurrentEstimate(est);
      triggerToast('success', `Satellite MRV pass completed for ${target.landName}. NDVI: ${est.ndviValue}`);
    } catch (err: any) {
      const isQuotaErr =
        err.errorCode === 'RATE_LIMIT_EXCEEDED' ||
        err.statusCode === 429 ||
        (err.message && (err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('limit')));

      if (isQuotaErr) {
        setQuotaExceeded(true);
        setQuotaErrorMessage(
          err.message || 'Daily Sentinel Hub API quota exceeded: Maximum 10 satellite analysis calls allowed per farmer per day.'
        );
        triggerToast('error', 'Daily Sentinel Hub API quota exceeded (10 calls/day limit).', 'RATE_LIMIT_EXCEEDED');
      } else {
        triggerToast('error', 'Satellite scan error: ' + err.message, err.errorCode);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Polygon Amoy Testnet Minting
  const handleMintToken = async () => {
    if (!currentEstimate || !currentLand) return;

    // Pre-check if already minted locally
    const existing = credits.find(c =>
      (currentEstimate.sentinelHubRequestId && c.sentinelHubRequestId === currentEstimate.sentinelHubRequestId) ||
      (c.landId === currentLand.id && Math.abs(c.amount - currentEstimate.carbonScore) < 0.01)
    );
    if (existing) {
      setMintResult({ success: true, credit: existing, polygonScanUrl: `${POLYGON_SCAN_AMOY_BASE}/tx/${existing.mintTxHash}` });
      triggerToast('info', `This carbon estimate has already been minted as Token #${existing.contractTokenId}.`);
      return;
    }

    setIsMinting(true);
    try {
      const result = await onMintCredit({
        landId: currentLand.id,
        ownerUid: currentLand.ownerUid,
        farmerName,
        landName: currentLand.landName,
        locationStr: `${currentLand.district}, ${currentLand.state}`,
        cropType: currentLand.primaryCrop,
        amount: currentEstimate.carbonScore,
        ndviScore: currentEstimate.ndviValue,
        sentinelHubRequestId: currentEstimate.sentinelHubRequestId,
        pricePerTonINR: 2200
      });

      setMintResult(result);
      triggerToast('success', `Successfully minted credit token on Polygon Amoy!`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      if (err.errorCode === 'DOUBLE_MINT_PROHIBITED' || (err.message && err.message.toLowerCase().includes('double-minting prohibited'))) {
        const existingCredit = credits.find(c =>
          (currentEstimate.sentinelHubRequestId && c.sentinelHubRequestId === currentEstimate.sentinelHubRequestId) ||
          c.landId === currentLand.id
        );
        if (existingCredit) {
          setMintResult({
            success: true,
            credit: existingCredit,
            polygonScanUrl: `${POLYGON_SCAN_AMOY_BASE}/tx/${existingCredit.mintTxHash}`
          });
        }
        triggerToast('info', err.message || 'Carbon credit token already minted for this estimate.');
      } else {
        triggerToast('error', 'Minting failed: ' + err.message, err.errorCode);
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Handle Listing Credit for Sale
  const handleListCreditForSale = async (creditId: string) => {
    const price = listingPriceMap[creditId] || 2200;
    setListingLoadingMap(prev => ({ ...prev, [creditId]: true }));
    try {
      await onListCredit(creditId, price);
      triggerToast('success', `Credit token listed on Marketplace @ ₹${price.toLocaleString('en-IN')}/Ton!`);
      confetti({ particleCount: 50, spread: 50 });
    } catch (err: any) {
      triggerToast('error', 'Failed to list credit: ' + err.message, err.errorCode);
    } finally {
      setListingLoadingMap(prev => ({ ...prev, [creditId]: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Overview Bento Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl relative overflow-hidden bg-grid-pattern"
      >
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-[11px] font-mono tracking-widest uppercase mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Smallholder Agricultural MRV Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-100 tracking-tight">
              Welcome back, <span className="text-emerald-400">{farmerName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Verify Sentinel-2 satellite vegetation index, measure carbon sequestration yields, and mint smart contract tokens on Polygon Amoy.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <RefetchButton onRefresh={handleRefetch} isLoading={isLoadingData} label="Sync Farmlands" />

            <button
              onClick={openRegistrationModal}
              aria-label="Register Farmland Plot"
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Register Farmland Plot</span>
            </button>
          </div>
        </div>

        {/* Bento Stat Strip */}
        {isLoadingData ? (
          <div className="mt-6 pt-6 border-t border-zinc-800/80">
            <SkeletonMetrics />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Total Farmland Area</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-zinc-100">{totalLandArea.toFixed(2)}</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Hectares</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{lands.length} Registered Plot(s)</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Minted Carbon Offset</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-emerald-400">{totalCreditsMinted.toFixed(2)}</span>
                <span className="text-xs font-mono text-zinc-400">Tons CO2e</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Verified via Sentinel-2</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Marketplace Revenue</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-zinc-100">₹{totalEarningsINR.toLocaleString('en-IN')}</span>
                <span className="text-xs font-mono text-emerald-400">INR</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Direct Farmer Proceeds</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Polygon Amoy Network</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-sm font-bold font-mono text-purple-300">Chain ID 80002</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Smart Contract Active
              </p>
            </motion.div>

          </div>
        )}

      </motion.div>

      {/* Error state if fetch failed */}
      {fetchError && (
        <ErrorState
          title="Failed to synchronize farmland data"
          message={fetchError.message}
          errorCode={fetchError.code}
          onRetry={handleRefetch}
        />
      )}

      {/* Empty State if Farmer has no registered lands */}
      {!isLoadingData && !fetchError && lands.length === 0 && (
        <EmptyState
          title="No lands registered yet"
          description="Draw your first farmland plot on the satellite map to start verifying vegetation density and minting carbon credits."
          actionText="Draw First Farmland Plot"
          onAction={openRegistrationModal}
          icon={<Sprout className="w-8 h-8 text-emerald-400" />}
        />
      )}

      {/* Polygon Processing Steps Indicator during Satellite Scan */}
      {isScanning && (
        <PolygonProcessingSteps currentStep={scanStep} progressPercent={scanProgress} />
      )}

      {/* Main Structural Grid: Farmland Selector + Satellite Verification Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Bento: Plot Selector & Polygon Map */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="lg:col-span-5 space-y-6"
        >
          
          <div className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider">Registered Farmlands</h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">{lands.length} Plot(s)</span>
            </div>

            {/* Selector Cards */}
            <div className="space-y-2.5">
              {lands.map((land, idx) => {
                const isSelected = land.id === currentLand?.id;
                return (
                  <motion.div
                    key={land.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedLandId(land.id);
                      setCurrentEstimate(null);
                      setMintResult(null);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#181a20] border-emerald-500/50 ring-1 ring-emerald-500/20'
                        : 'bg-[#14161c]/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#181a20]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                          {land.landName}
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{land.district}, {land.state}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                        {land.areaHectares} Ha
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-300">
                      <div><span className="text-zinc-500 font-mono">Crop:</span> {land.primaryCrop}</div>
                      <div><span className="text-zinc-500 font-mono">System:</span> {land.practiceType}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Interactive Boundary Geo-Polygon Map */}
          {currentLand && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-display">
                  GPS Farmland Boundary
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {currentLand.polygonCoordinates.length} Vertices
                </span>
              </div>
              
              <LandMap
                polygonCoords={currentLand.polygonCoordinates}
                setPolygonCoords={() => {}}
                areaHectares={currentLand.areaHectares}
                selectedPreset={null}
                setSelectedPreset={() => {}}
                showNdviOverlay={!!currentEstimate}
                ndviScore={currentEstimate?.ndviValue || currentLand.lastNdviScore || 0.72}
              />
            </motion.div>
          )}

        </motion.div>

        {/* Right Bento: Sentinel-2 Satellite MRV Engine & Blockchain Minting */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6"
        >
          
          <div className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center space-x-2">
                  <Satellite className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base font-bold font-display text-zinc-100">Sentinel-2 Multispectral Analysis</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time Sentinel-2 L2A satellite pass verification for <strong className="text-zinc-200">{currentLand?.landName}</strong>
                </p>
              </div>

              <button
                onClick={() => handleTriggerSatelliteScan()}
                disabled={isScanning || quotaExceeded}
                title={quotaExceeded ? "Quota exceeded: Maximum 10 satellite calls/day reached" : "Run Satellite Scan"}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md shrink-0 ${
                  quotaExceeded
                    ? 'bg-zinc-800/90 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                    : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-emerald-600/20'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>
                  {isScanning
                    ? 'Querying Satellite...'
                    : quotaExceeded
                    ? 'Quota Exceeded (Disabled)'
                    : 'Run Satellite Scan'}
                </span>
              </button>
            </div>

            {/* Quota Exceeded Alert Callout Banner */}
            {quotaExceeded && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start space-x-3 text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-amber-300 font-display">Daily Satellite API Quota Exceeded</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase border border-amber-500/30">
                      10 Calls/Day Limit
                    </span>
                  </div>
                  <p className="text-amber-200/90 leading-relaxed">{quotaErrorMessage}</p>
                  <p className="text-[11px] text-amber-400/80 font-mono pt-1">
                    The "Run Satellite Scan" button is temporarily disabled for this farmer profile. Previously verified 30-day carbon estimates will continue to be served from the cache.
                  </p>
                </div>
              </div>
            )}

            {/* Radar Animation Scanning State */}
            {isScanning && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-[#181a20]/80 rounded-xl border border-zinc-800/80 relative overflow-hidden">
                <div className="relative w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping"></div>
                  <div className="w-12 h-12 rounded-full border border-emerald-500/40 flex items-center justify-center">
                    <Radar className="w-6 h-6 text-emerald-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 font-display">Processing Band B04 (665nm) & Band B08 (842nm)...</p>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    Fetching multispectral satellite bands from Sentinel Hub & calculating Mean NDVI vegetation vigor index.
                  </p>
                </div>
              </div>
            )}

            {/* Satellite Scan Output Card */}
            {!isScanning && currentEstimate && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Mean NDVI Card */}
                  <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Mean Satellite NDVI Index</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-display text-emerald-400">{currentEstimate.ndviValue}</span>
                      <span className="text-xs font-mono text-zinc-400">/ 1.0 (High Biomass)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${Math.min(currentEstimate.ndviValue * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Carbon Sequestration Yield */}
                  <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Estimated Carbon Sequestration</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-display text-emerald-400">{currentEstimate.carbonScore}</span>
                      <span className="text-xs font-mono text-zinc-300">Tons CO2e / Year</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Plot Area: {currentLand.areaHectares} Ha • Factor: Agroforestry Biomass
                    </p>
                  </div>

                </div>

                {/* Audit Sensor Metadata Table */}
                <div className="p-4 rounded-xl bg-[#14161c] border border-zinc-800/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800 pb-2">
                    <span className="flex items-center gap-1.5 text-zinc-200 font-mono text-[11px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Sentinel Hub Satellite Audit Proof
                    </span>
                    <div className="flex items-center space-x-2">
                      {currentEstimate.dataSource && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                          currentEstimate.dataSource === 'in-memory-cache'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : currentEstimate.dataSource === 'firestore-30day-cache'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {currentEstimate.dataSource === 'in-memory-cache'
                            ? '⚡ 1-Hr Memory Cache'
                            : currentEstimate.dataSource === 'firestore-30day-cache'
                            ? '💾 30-Day Firestore Cache'
                            : '🛰️ Fresh Sentinel API'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {currentEstimate.sentinelHubRequestId}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-zinc-300 font-mono text-[11px]">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Satellite</span>
                      {currentEstimate.auditDetails.satelliteSensor}
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Pass Date</span>
                      {currentEstimate.auditDetails.satellitePassDate}
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Cloud Cover</span>
                      {currentEstimate.auditDetails.cloudCoverPercent}%
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Band B04 (Red)</span>
                      {currentEstimate.auditDetails.rawB04_Red}
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Band B08 (NIR)</span>
                      {currentEstimate.auditDetails.rawB08_NIR}
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Verification</span>
                      <span className="text-emerald-400">Sentinel L2A Approved</span>
                    </div>
                  </div>
                </div>

                {/* Minting Call to Action / Minted Token Status */}
                {(() => {
                  const activeCredit = mintResult?.credit || (currentEstimate ? credits.find(c =>
                    (currentEstimate.sentinelHubRequestId && c.sentinelHubRequestId === currentEstimate.sentinelHubRequestId) ||
                    (c.landId === currentLand.id && Math.abs(c.amount - currentEstimate.carbonScore) < 0.01)
                  ) : null);

                  if (!activeCredit) {
                    return (
                      <div className="p-4 rounded-xl bg-[#181a20] border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                            <Coins className="w-4 h-4 text-purple-400" />
                            Mint {currentEstimate.carbonScore} CO2e Token on Polygon Amoy
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Anchor satellite yield to Polygon testnet smart contract.
                          </p>
                        </div>

                        <button
                          onClick={handleMintToken}
                          disabled={isMinting}
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center space-x-2 shrink-0 disabled:opacity-50"
                        >
                          {isMinting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Signing Transaction...</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              <span>Mint on Polygon Amoy</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  }

                  const scanUrl = mintResult?.polygonScanUrl || `${POLYGON_SCAN_AMOY_BASE}/tx/${activeCredit.mintTxHash}`;

                  return (
                    /* Minted Token Banner */
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Carbon Credit Token Minted (#{activeCredit.contractTokenId})</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-mono">
                        Token ID: <strong className="text-zinc-100">#{activeCredit.contractTokenId}</strong> | Hash:{' '}
                        <span className="text-emerald-400">{activeCredit.mintTxHash ? activeCredit.mintTxHash.substring(0, 18) + '...' : '0x...'}</span> | Status:{' '}
                        <span className="uppercase text-purple-300 font-bold">{activeCredit.status}</span>
                      </p>
                      <div className="pt-1">
                        <a
                          href={scanUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-mono underline"
                        >
                          <span>View Transaction on PolygonScan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            )}

            {/* Prompt when scan hasn't been run */}
            {!isScanning && !currentEstimate && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-[#181a20]/40 rounded-xl border border-zinc-800/80">
                <Satellite className="w-8 h-8 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-300">Ready to Analyze Satellite Vegetation</p>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Click <strong>"Run Satellite Scan"</strong> to query Sentinel-2 multispectral imagery for plot <em>{currentLand?.landName}</em>.
                </p>
              </div>
            )}

          </div>

          {/* Farmer's Minted Inventory & Listing */}
          <div className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                My Minted Credit Tokens ({credits.length})
              </h2>
            </div>

            {credits.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No credits minted yet. Run a satellite scan above to mint your first credit token.</p>
            ) : (
              <div className="space-y-3">
                {credits.map((credit, idx) => (
                  <motion.div 
                    key={credit.id} 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-3.5 rounded-xl bg-[#181a20] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-100">{credit.landName}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                          credit.status === 'sold'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : credit.status === 'listed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {credit.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-zinc-400 mt-1 font-mono text-[11px]">
                        <span>{credit.amount} Tons CO2e</span>
                        <span>•</span>
                        <span>NDVI {credit.ndviScore}</span>
                        <span>•</span>
                        <span className="text-purple-300">Token #{credit.contractTokenId}</span>
                      </div>
                    </div>

                    {/* Listing Action */}
                    <div>
                      {credit.status === 'minted' && (
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-500">₹</span>
                            <input
                              type="number"
                              min="500"
                              max="10000"
                              step="100"
                              value={listingPriceMap[credit.id] || 2200}
                              onChange={(e) => setListingPriceMap({ ...listingPriceMap, [credit.id]: Number(e.target.value) })}
                              className="w-24 bg-[#12141a] border border-zinc-700 rounded-lg pl-6 pr-2 py-1 text-xs text-zinc-100 font-mono"
                              placeholder="Price"
                            />
                          </div>
                          <button
                            onClick={() => handleListCreditForSale(credit.id)}
                            disabled={listingLoadingMap[credit.id]}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            List Credit
                          </button>
                        </div>
                      )}

                      {credit.status === 'listed' && (
                        <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                          Listed @ ₹{(credit.pricePerTonINR || (credit.pricePerTonUSD ? credit.pricePerTonUSD * APPROX_INR_PER_USD : 2200)).toLocaleString('en-IN')}/Ton
                        </span>
                      )}

                      {credit.status === 'sold' && (
                        <span className="text-[11px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                          Sold (₹{(credit.totalPriceINR || (credit.totalPriceUSD ? credit.totalPriceUSD * APPROX_INR_PER_USD : 0)).toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </motion.div>

      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-50 bg-[#0b0c0e]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#12141a] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  Register Farmland Boundary GPS Polygon
                </h2>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="text-zinc-400 hover:text-white text-base font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                
                {/* Mandatory Manual Farmland Name Input */}
                <div className="bg-[#181a20] p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-zinc-100 font-bold text-xs">
                      Farmland Plot Name <span className="text-emerald-400 font-semibold text-[11px]">(Mandatory) *</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Required</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={landName}
                    onChange={e => setLandName(e.target.value)}
                    className="w-full bg-[#12141a] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 font-medium focus:outline-none focus:border-emerald-500 text-xs"
                    placeholder="e.g. Kaveri Delta Plot Sector 4"
                  />
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Please manually enter a unique name for this farmland plot before saving.
                  </p>
                </div>

                {/* Crop & Soil Configuration Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Primary Crop Type</label>
                    <input
                      type="text"
                      required
                      value={primaryCrop}
                      onChange={e => setPrimaryCrop(e.target.value)}
                      className="w-full bg-[#181a20] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Organic Rice & Pulses"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Soil Classification</label>
                    <input
                      type="text"
                      value={soilType}
                      onChange={e => setSoilType(e.target.value)}
                      className="w-full bg-[#181a20] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Alluvial Clay"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-300 font-medium mb-1">Agricultural Practice</label>
                    <select
                      value={practiceType}
                      onChange={e => setPracticeType(e.target.value as any)}
                      className="w-full bg-[#181a20] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Agroforestry">Agroforestry</option>
                      <option value="No-Till Farming">No-Till Farming</option>
                      <option value="Cover Cropping">Cover Cropping</option>
                      <option value="Organic Farming">Organic Farming</option>
                      <option value="Integrated Pest Mgmt">Integrated Pest Mgmt</option>
                    </select>
                  </div>
                </div>

                {/* Map Polygon Placement */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-zinc-300 font-medium">Draw Farmland GPS Boundary Coordinates</label>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Auto-location on save
                    </span>
                  </div>
                  <LandMap
                    polygonCoords={polygonCoords}
                    setPolygonCoords={setPolygonCoords}
                    areaHectares={polygonCoords.length >= 3 ? Number((polygonCoords.length * 1.25).toFixed(2)) : 0}
                    selectedPreset={selectedPreset}
                    setSelectedPreset={setSelectedPreset}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
                  <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl w-full sm:w-auto">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Location (District & State) auto-detected from map boundary coordinates on save</span>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      disabled={isGeocoding}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGeocoding}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center space-x-2"
                    >
                      {isGeocoding ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting Location & Saving...</span>
                        </>
                      ) : (
                        <span>Save Farmland</span>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
