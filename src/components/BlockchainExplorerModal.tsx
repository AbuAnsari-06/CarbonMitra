import React, { useState } from 'react';
import { DUMMY_CONTRACT_ADDRESS, POLYGON_SCAN_AMOY_BASE } from '../data/presets';
import { TransactionRecord, CarbonCredit } from '../types';
import { Cpu, ExternalLink, Copy, Check, ShieldCheck, ArrowRightLeft, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlockchainExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: CarbonCredit[];
  transactions: TransactionRecord[];
}

export const BlockchainExplorerModal: React.FC<BlockchainExplorerModalProps> = ({
  isOpen,
  onClose,
  credits,
  transactions
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(DUMMY_CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#0b0c0e]/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#12141a] border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-zinc-100">Polygon Amoy Testnet Inspector</h2>
                <p className="text-xs text-purple-300 font-mono">Chain ID: 80002 • Deployed Smart Contract</p>
              </div>
            </div>

            <button onClick={onClose} className="text-zinc-400 hover:text-white text-base font-bold">
              ✕
            </button>
          </div>

          {/* Contract Address & Network Info */}
          <div className="p-4 rounded-xl bg-[#181a20] border border-zinc-800/80 space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">Smart Contract Address</span>
            <div className="flex items-center justify-between bg-[#12141a] p-2.5 rounded-lg border border-zinc-800/80 font-mono text-xs text-purple-300">
              <span className="truncate">{DUMMY_CONTRACT_ADDRESS}</span>
              <button
                onClick={handleCopy}
                className="ml-2 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded text-[11px] flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Address'}</span>
              </button>
            </div>
          </div>

          {/* Recent Contract Events */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase text-zinc-400 tracking-wider font-bold">Contract Events Log</h3>

            <div className="space-y-2">
              {credits.map(credit => (
                <div key={credit.id} className="p-3 rounded-xl bg-[#181a20] border border-zinc-800/80 text-xs flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-emerald-400 font-bold">CreditMinted</span>
                      <span className="text-zinc-400 text-[11px] block font-sans">
                        Token #{credit.contractTokenId} • {credit.amount} Tons CO2e
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://amoy.polygonscan.com/tx/${credit.mintTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline text-[11px] flex items-center gap-1"
                  >
                    <span>{credit.mintTxHash.substring(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}

              {transactions.map(tx => (
                <div key={tx.id} className="p-3 rounded-xl bg-[#181a20] border border-zinc-800/80 text-xs flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-indigo-400 font-bold">CreditTransferred</span>
                      <span className="text-zinc-400 text-[11px] block font-sans">
                        Token #{tx.tokenId} • To: {tx.toName} (₹{(tx.priceINR || (tx.priceUSD ? tx.priceUSD * 80 : 0)).toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  <a
                    href={tx.polygonScanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline text-[11px] flex items-center gap-1"
                  >
                    <span>{tx.txHash.substring(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
            <a
              href={POLYGON_SCAN_AMOY_BASE}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 underline flex items-center gap-1 font-mono"
            >
              <span>Open PolygonScan Amoy Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
