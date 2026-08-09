import React from 'react';
import { CarbonCredit, Land, TransactionRecord } from '../types';
import { ShieldCheck, Satellite, Cpu, ExternalLink, FileCode, CheckCircle2, Terminal } from 'lucide-react';
import { POLYGON_SCAN_AMOY_BASE, DUMMY_CONTRACT_ADDRESS } from '../data/presets';
import { motion } from 'motion/react';

interface AuditorViewProps {
  lands: Land[];
  credits: CarbonCredit[];
  transactions: TransactionRecord[];
  onOpenExplorer: () => void;
}

export const AuditorView: React.FC<AuditorViewProps> = ({
  lands,
  credits,
  transactions,
  onOpenExplorer
}) => {
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
            <div className="flex items-center space-x-2 text-amber-400 text-[11px] font-mono tracking-widest uppercase mb-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Independent MRV Audit & Verification Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-100 tracking-tight">
              Satellite Audit Registry
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Inspect raw Sentinel-2 multispectral API requests, NDVI formula coefficients, and Polygon Amoy smart contract execution logs.
            </p>
          </div>

          <button
            onClick={onOpenExplorer}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Polygon Inspector</span>
          </button>
        </div>
      </motion.div>

      {/* Audit Registry Table */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Satellite className="w-4 h-4 text-amber-400" />
            Sentinel Request Audit Trail ({credits.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#181a20] text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-800/80">
              <tr>
                <th className="p-3">Sentinel Request ID</th>
                <th className="p-3">Farmland Plot</th>
                <th className="p-3">Location</th>
                <th className="p-3">NDVI Score</th>
                <th className="p-3">Carbon Yield</th>
                <th className="p-3">Token ID</th>
                <th className="p-3">Mint Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {credits.map((credit, idx) => (
                <motion.tr 
                  key={credit.id} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="hover:bg-[#181a20]/60 transition-colors"
                >
                  <td className="p-3 text-emerald-400 font-bold">{credit.sentinelHubRequestId}</td>
                  <td className="p-3 font-sans text-zinc-100 font-medium">{credit.landName}</td>
                  <td className="p-3 font-sans text-zinc-400">{credit.locationStr}</td>
                  <td className="p-3 font-bold text-amber-400">{credit.ndviScore}</td>
                  <td className="p-3 font-sans font-bold text-zinc-200">{credit.amount} Tons</td>
                  <td className="p-3 text-purple-300">#{credit.contractTokenId}</td>
                  <td className="p-3">
                    <a
                      href={`https://amoy.polygonscan.com/tx/${credit.mintTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 underline"
                    >
                      <span>{credit.mintTxHash.substring(0, 12)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Smart Contract Specifications Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="bg-[#12141a] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4"
      >
        <h2 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-400" />
          Polygon Amoy Deployed Smart Contract Specification
        </h2>

        <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 font-mono text-xs space-y-2">
          <div className="flex justify-between text-zinc-400">
            <span>Contract Address:</span>
            <span className="text-purple-300">{DUMMY_CONTRACT_ADDRESS}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Network Chain ID:</span>
            <span className="text-zinc-200">80002 (Polygon Amoy Testnet)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Core Functions:</span>
            <span className="text-emerald-400">mintCredit(address, amount, landId, requestId)</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

