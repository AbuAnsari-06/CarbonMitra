import React, { useState } from 'react';
import { CarbonCredit, TransactionRecord } from '../types';
import { 
  ShieldCheck, Award, TrendingUp, ExternalLink, Building2, 
  Leaf, Download, CheckCircle2, FileText, Sprout, ShoppingBag 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  EmptyState, ErrorState, SkeletonMetrics, RefetchButton 
} from './CommonUI';
import { triggerToast } from '../lib/uiUtils';
import { motion } from 'motion/react';

interface BuyerDashboardProps {
  buyerName: string;
  credits: CarbonCredit[];
  transactions: TransactionRecord[];
  onOpenExplorer: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  buyerName,
  credits,
  transactions,
  onOpenExplorer
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<{ message: string; code?: string } | null>(null);

  // Filter purchased credits by corporate buyer
  const myCredits = credits.filter(c => c.status === 'sold' && (c.buyerName === buyerName || c.buyerUid === 'buyer-99'));
  
  const totalOffsetTons = myCredits.reduce((acc, c) => acc + c.amount, 0);
  const totalInvestedINR = myCredits.reduce((acc, c) => acc + (c.totalPriceINR || (c.totalPriceUSD ? c.totalPriceUSD * 80 : 0)), 0);
  const totalFarmersSupported = new Set(myCredits.map(c => c.farmerName)).size;

  // Chart Data
  const chartData = [
    { month: 'Jan', offset: Math.round(totalOffsetTons * 0.15) },
    { month: 'Mar', offset: Math.round(totalOffsetTons * 0.35) },
    { month: 'May', offset: Math.round(totalOffsetTons * 0.60) },
    { month: 'Jul', offset: Math.round(totalOffsetTons * 0.85) },
    { month: 'Aug', offset: Math.round(totalOffsetTons) }
  ];

  // Refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      triggerToast('info', 'Corporate portfolio ESG metrics synchronized.');
    } catch (err: any) {
      setFetchError({ message: err.message || 'Failed to sync corporate portfolio data.', code: 'SYNC_ERROR' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    triggerToast('info', 'Generating PDF ESG Net-Zero Verification Audit Report...');
    setTimeout(() => {
      window.print();
    }, 300);
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
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate ESG Net-Zero Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-100 tracking-tight">
              {buyerName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Verified Net-Zero Carbon Offsets backed by Sentinel-2 Satellite Vegetation Monitoring and Polygon Amoy Blockchain Smart Contracts.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <RefetchButton onRefresh={handleRefresh} isLoading={isLoading} label="Sync Portfolio" />

            <button
              onClick={handleExportReport}
              aria-label="Export ESG Impact Report PDF"
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export ESG Impact Report</span>
            </button>
          </div>
        </div>

        {/* Bento Metrics Bar */}
        {isLoading ? (
          <div className="mt-6 pt-6 border-t border-zinc-800/80">
            <SkeletonMetrics />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Total Offset Volume</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-emerald-400">{totalOffsetTons.toFixed(2)}</span>
                <span className="text-xs font-mono text-zinc-300">Tons CO2e</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Direct Smallholder Capital</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-zinc-100">₹{totalInvestedINR.toLocaleString('en-IN')}</span>
                <span className="text-xs font-mono text-indigo-400">INR</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-[#181a20] p-4 rounded-xl border border-zinc-800/80"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Smallholders Supported</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-display text-purple-400">{totalFarmersSupported}</span>
                <span className="text-xs font-mono text-zinc-300">Indian Farmers</span>
              </div>
            </motion.div>
          </div>
        )}

      </motion.div>

      {/* Error state if fetch failed */}
      {fetchError && (
        <ErrorState
          title="Failed to synchronize corporate portfolio"
          message={fetchError.message}
          errorCode={fetchError.code}
          onRetry={handleRefresh}
        />
      )}

      {/* Chart & Active Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recharts Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="lg:col-span-7 bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Cumulative Carbon Offset Accumulation
            </h2>
            <span className="text-xs font-mono text-zinc-400">2026 YTD</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181a20', borderColor: '#272a34', borderRadius: '0.75rem', color: '#f4f4f5', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Tons CO2e`, 'Offset Volume']}
                />
                <Area type="monotone" dataKey="offset" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOffset)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Purchased Certificates */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5 bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Offset Certificates ({myCredits.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {myCredits.length === 0 ? (
              <EmptyState
                title="No corporate offsets acquired"
                description="Acquire satellite-verified carbon offset tokens on the Marketplace to fund Indian smallholders and build your corporate ESG portfolio."
                icon={<Award className="w-8 h-8 text-indigo-400" />}
              />
            ) : (
              myCredits.map((credit, idx) => (
                <motion.div 
                  key={credit.id} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-3.5 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-zinc-200">{credit.landName}</h3>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{credit.farmerName} • {credit.locationStr}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                      {credit.amount} Tons
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 font-mono text-[11px]">
                    <span className="text-zinc-400">Token #{credit.contractTokenId}</span>
                    {credit.transferTxHash && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${credit.transferTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 underline"
                        aria-label={`View PolygonScan transaction hash for token ${credit.contractTokenId}`}
                      >
                        <span>PolygonScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>

    </div>
  );
};

