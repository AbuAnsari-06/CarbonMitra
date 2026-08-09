import React, { useState } from 'react';
import { CarbonCredit } from '../types';
import { 
  ShoppingBag, Search, Filter, ShieldCheck, Satellite, 
  ExternalLink, CheckCircle2, Award, ArrowUpRight, Sparkles, Building2, Coins, ChevronRight, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  EmptyState, ErrorState, SkeletonCard, RefetchButton 
} from './CommonUI';
import { triggerToast } from '../lib/uiUtils';

interface MarketplaceProps {
  credits: CarbonCredit[];
  buyerName: string;
  onBuyCredit: (creditId: string, buyerName: string) => Promise<any>;
  onOpenExplorer: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  credits,
  buyerName,
  onBuyCredit,
  onOpenExplorer
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [minNdvi, setMinNdvi] = useState<number>(0);
  const [purchasingCreditId, setPurchasingCreditId] = useState<string | null>(null);
  const [selectedCreditDetail, setSelectedCreditDetail] = useState<CarbonCredit | null>(null);
  const [purchasedSuccess, setPurchasedSuccess] = useState<any | null>(null);

  // Pagination & Loading States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<{ message: string; code?: string } | null>(null);
  const [pageSize, setPageSize] = useState<number>(6);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Filter listed credits
  const filteredCredits = credits.filter(c => {
    if (c.status !== 'listed' && c.status !== 'sold') return false;
    
    const matchesSearch = c.landName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.farmerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = selectedCrop === 'all' || c.cropType.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesNdvi = c.ndviScore >= minNdvi;

    return matchesSearch && matchesCrop && matchesNdvi;
  });

  // Cursor-based paginated subset
  const visibleCredits = filteredCredits.slice(0, pageSize);

  // Crop type options
  const cropOptions = Array.from(new Set(credits.map(c => c.cropType.split(' ')[0])));

  // Refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      triggerToast('info', 'Marketplace carbon listings updated.');
    } catch (err: any) {
      setFetchError({ message: err.message || 'Failed to refresh marketplace listings.', code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Buy Credit
  const handlePurchase = async (credit: CarbonCredit) => {
    setPurchasingCreditId(credit.id);
    try {
      const result = await onBuyCredit(credit.id, buyerName);
      setPurchasedSuccess(result);
      setSelectedCreditDetail(null);
      triggerToast('success', `Purchased ${credit.amount} Tons CO2e from ${credit.farmerName} on Polygon Amoy!`);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err: any) {
      triggerToast('error', 'Purchase transaction failed: ' + err.message, err.errorCode);
    } finally {
      setPurchasingCreditId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl relative overflow-hidden bg-grid-pattern"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-[11px] font-mono tracking-widest uppercase mb-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Verified Smallholder Carbon Credit Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-100 tracking-tight">
              Carbon Credit Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Acquire satellite-verified carbon offset tokens directly from smallholder agricultural landholders in India.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#181a20] px-4 py-3 rounded-xl border border-zinc-800/80 shrink-0">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Active Corporate Buyer</p>
              <p className="text-xs font-bold text-zinc-100">{buyerName}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Controls Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
        className="bg-[#12141a] p-4 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs"
      >
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Search farm plot, farmer name, or region"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search farm plot, farmer name, or region..."
            className="w-full bg-[#181a20] border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters & Refresh Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-2">
            <label htmlFor="crop-filter-select" className="text-zinc-400 font-mono text-[11px]">Crop:</label>
            <select
              id="crop-filter-select"
              aria-label="Filter carbon credits by crop type"
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="bg-[#181a20] border border-zinc-700/80 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="all">All Crops</option>
              {cropOptions.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="ndvi-filter-select" className="text-zinc-400 font-mono text-[11px]">Min NDVI:</label>
            <select
              id="ndvi-filter-select"
              aria-label="Filter carbon credits by minimum NDVI vegetation score"
              value={minNdvi}
              onChange={e => setMinNdvi(Number(e.target.value))}
              className="bg-[#181a20] border border-zinc-700/80 text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="0">Any Score</option>
              <option value="0.65">High Biomass (&gt;0.65)</option>
              <option value="0.75">Premium Vigor (&gt;0.75)</option>
            </select>
          </div>

          <RefetchButton onRefresh={handleRefresh} isLoading={isLoading} label="Sync Credits" />

        </div>

      </motion.div>

      {/* Error state if fetch failed */}
      {fetchError && (
        <ErrorState
          title="Failed to load carbon credit listings"
          message={fetchError.message}
          errorCode={fetchError.code}
          onRetry={handleRefresh}
        />
      )}

      {/* Skeleton Loading State */}
      {isLoading ? (
        <SkeletonCard count={6} />
      ) : visibleCredits.length === 0 ? (
        <EmptyState
          title="No carbon credits found"
          description={
            searchTerm || selectedCrop !== 'all' || minNdvi > 0
              ? "No carbon credit listings match your active search filter criteria. Try clearing or relaxing filters."
              : "No carbon credits currently listed on the marketplace. Farmer verification scans will post credits here."
          }
          actionText={searchTerm || selectedCrop !== 'all' || minNdvi > 0 ? "Clear Search Filters" : undefined}
          onAction={
            searchTerm || selectedCrop !== 'all' || minNdvi > 0
              ? () => {
                  setSearchTerm('');
                  setSelectedCrop('all');
                  setMinNdvi(0);
                }
              : undefined
          }
          icon={<Coins className="w-8 h-8 text-indigo-400" />}
        />
      ) : (
        <>
          {/* Credit Tokens Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCredits.map((credit, idx) => (
              <motion.div
                key={credit.id}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.35, delay: (idx % 3) * 0.08, ease: "easeOut" }}
                className="bg-[#12141a] rounded-2xl border border-zinc-800/80 hover:border-zinc-700 p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Sentinel-2 Verified
                      </span>
                      <h3 className="font-bold text-base text-zinc-100 mt-2 group-hover:text-indigo-300 transition-colors">
                        {credit.landName}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">📍 {credit.locationStr}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold font-display text-emerald-400">
                        ₹{(credit.pricePerTonINR || (credit.pricePerTonUSD ? credit.pricePerTonUSD * 80 : 2200)).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-zinc-500 block font-mono">/ Ton CO2e</span>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-[#181a20] border border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-mono block">Offset Quantity</span>
                      <span className="font-bold text-zinc-200">{credit.amount} Metric Tons</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-mono block">Sentinel NDVI</span>
                      <span className="font-bold text-emerald-400">{credit.ndviScore} Score</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-mono block">Farmer</span>
                      <span className="text-zinc-300 truncate block">{credit.farmerName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-mono block">Token ID</span>
                      <span className="font-mono text-purple-300">#{credit.contractTokenId}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Purchase Bar */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase">Total Price</span>
                    <span className="text-sm font-bold text-zinc-100">
                      ₹{(credit.totalPriceINR || (credit.totalPriceUSD ? credit.totalPriceUSD * 80 : 0)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {credit.status === 'listed' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCreditDetail(credit)}
                        aria-label={`View verification audit details for credit ${credit.contractTokenId}`}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-all"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handlePurchase(credit)}
                        disabled={purchasingCreditId === credit.id}
                        aria-label={`Buy carbon credit token ${credit.contractTokenId}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                      >
                        {purchasingCreditId === credit.id ? 'Buying...' : 'Buy Token'}
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 font-mono text-[11px] font-semibold rounded-xl border border-purple-500/20">
                      Purchased by {credit.buyerName || 'Corporate'}
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </div>

          {/* Pagination / Cursor Load More */}
          {filteredCredits.length > pageSize && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setPageSize(prev => prev + 6)}
                className="px-6 py-2.5 bg-[#181a20] hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-mono flex items-center space-x-2 transition-all active:scale-95 shadow-md"
              >
                <span>Load More Carbon Credit Listings ({filteredCredits.length - pageSize} remaining)</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCreditDetail && (
          <div className="fixed inset-0 z-50 bg-[#0b0c0e]/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#12141a] border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold font-display text-base text-zinc-100 flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-emerald-400" />
                  Satellite & Contract Verification Audit
                </h3>
                <button
                  onClick={() => setSelectedCreditDetail(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-2">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Farmland Plot:</span>
                    <strong className="text-white">{selectedCreditDetail.landName}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Farmer:</span>
                    <span>{selectedCreditDetail.farmerName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Location:</span>
                    <span>{selectedCreditDetail.locationStr}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Crop System:</span>
                    <span>{selectedCreditDetail.cropType}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-2 font-mono">
                  <h4 className="font-bold text-zinc-200 text-xs font-sans">Sentinel-2 Satellite Proofs</h4>
                  <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                    <div><span className="text-zinc-500 block text-[9px] uppercase">NDVI Score</span> {selectedCreditDetail.ndviScore}</div>
                    <div><span className="text-zinc-500 block text-[9px] uppercase">Offset</span> {selectedCreditDetail.amount} Tons</div>
                    <div><span className="text-zinc-500 block text-[9px] uppercase">Sentinel Request</span> <span className="text-emerald-400">{selectedCreditDetail.sentinelHubRequestId}</span></div>
                    <div><span className="text-zinc-500 block text-[9px] uppercase">Polygon Token ID</span> <span className="text-purple-300">#{selectedCreditDetail.contractTokenId}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedCreditDetail(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePurchase(selectedCreditDetail)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Purchase Token for ₹{(selectedCreditDetail.totalPriceINR || (selectedCreditDetail.totalPriceUSD ? selectedCreditDetail.totalPriceUSD * 80 : 0)).toLocaleString('en-IN')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {purchasedSuccess && (
          <div className="fixed inset-0 z-50 bg-[#0b0c0e]/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Official Carbon Offset Certificate</span>
                <h2 className="text-xl font-bold font-display text-zinc-100 mt-1">Offset Purchase Confirmed</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Transferred on Polygon Amoy Testnet to <strong className="text-zinc-200">{purchasedSuccess.credit.buyerName}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Offset Volume:</span>
                  <strong className="text-emerald-400 font-bold">{purchasedSuccess.credit.amount} Metric Tons CO2e</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Beneficiary Farmer:</span>
                  <span className="text-zinc-200">{purchasedSuccess.credit.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Purchase Value:</span>
                  <span className="text-zinc-200">
                    ₹{(purchasedSuccess.credit.totalPriceINR || (purchasedSuccess.credit.totalPriceUSD ? purchasedSuccess.credit.totalPriceUSD * 80 : 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-zinc-400">Blockchain Hash:</span>
                  <span className="text-purple-300">{purchasedSuccess.transaction.txHash.substring(0, 16)}...</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <a
                  href={purchasedSuccess.transaction.polygonScanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-mono flex items-center space-x-1.5"
                >
                  <span>PolygonScan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setPurchasedSuccess(null)}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/10"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
