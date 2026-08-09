import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BookOpen,
  MapPin,
  Satellite,
  Coins,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  IndianRupee,
  Layers,
  FileText
} from "lucide-react";

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpManualModal: React.FC<HelpManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "farmer" | "buyer" | "auditor" | "faq">("overview");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#111318] border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-[#161922]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Platform User Manual & Operating Guide</h2>
                <p className="text-xs text-gray-400">Comprehensive instructions for Farmers, Corporate Buyers, and Auditors</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition"
              aria-label="Close user manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 py-3 bg-[#0d0e12] border-b border-gray-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Workflow Overview
            </button>
            <button
              onClick={() => setActiveTab("farmer")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === "farmer"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Farmer Guide
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === "buyer"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Buyer Guide
            </button>
            <button
              onClick={() => setActiveTab("auditor")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === "auditor"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Auditor Guide
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === "faq"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ & Guidance
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-gray-900/40 border border-emerald-500/20">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">Platform Mechanics</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    This platform connects sustainable agricultural practices directly with carbon credit buyers through satellite remote sensing and transparent blockchain recording.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="text-sm font-semibold text-white">Land Boundary & Satellite NDVI</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Farmers register farmland boundaries on the interactive map. The system analyzes Sentinel-2 multispectral band data to compute real-time NDVI vegetation density.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h4 className="text-sm font-semibold text-white">Blockchain Tokenization</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sequestration estimates (CO₂e tons) are minted as immutable smart contract tokens on the Polygon Amoy testnet, preserving tamper-proof proof of origin.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h4 className="text-sm font-semibold text-white">Rupee Marketplace & Retirement</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Corporate buyers purchase verified credits in Indian Rupees (₹), supporting climate-smart farmers and fulfilling corporate ESG offset commitments.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161922] border border-gray-800">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Key Platform Capabilities</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Interactive Boundary Polygon Mapping</strong> with Turf.js area calculation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Sentinel-2 Multispectral Analysis</strong> (Red & Near-Infrared bands)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Automated GPS Geocoding</strong> for instant location & district detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Polygon Blockchain Inspector</strong> with live transaction hash verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Indian Rupee (₹) Transactions</strong> with instant digital receipts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Full Auditor MRV Dashboard</strong> with raw satellite spectral telemetry</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "farmer" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Farmer Operating Steps</h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Step 1: Register Your Farmland Plot</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Go to the <strong>Farmer Portal</strong> tab and click "Add New Farmland". Type your custom plot name manually (or leave blank to auto-name), drop your boundary GPS pins on the satellite map, and save. The location, district, and state are automatically detected from your map boundary.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
                      <Satellite className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Step 2: Trigger Satellite Vegetation Verification</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Run Satellite Scan" to retrieve real-time vegetation imagery from Sentinel-2. The system computes your NDVI score and estimates your annual carbon sequestration in CO₂e metric tons.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Step 3: Mint & List Carbon Credits</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Mint Carbon Credit Token". The system creates a verified token on the Polygon Amoy blockchain. Specify your desired sale price per ton in Indian Rupees (₹/ton) and list it on the public marketplace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "buyer" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Corporate Buyer Guide</h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Browse Marketplace Listings</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Navigate to the <strong>Marketplace</strong> tab. Filter available carbon credits by region, crop type, price per ton (₹), and NDVI health score.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Purchase & Transfer Smart Contract Ownership</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Purchase Credit Token" to complete the transaction in Indian Rupees (₹). Ownership is automatically transferred to your buyer wallet address on the Polygon blockchain testnet.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Corporate ESG Dashboard & Certificate Generation</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Open the <strong>Buyer Portfolio</strong> tab to track your cumulative CO₂e offset metrics, view impact distribution charts, and download verified ESG compliance certificates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "auditor" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Auditor & Verifier Protocol</h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 space-y-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Raw Satellite Spectral Inspection
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Auditors can view exact Red (B04) and Near-Infrared (B08) raw reflectance values returned from Sentinel-2 passes, ensuring complete formula auditability: <code className="bg-black/50 px-1.5 py-0.5 rounded text-emerald-400 text-[11px]">NDVI = (NIR - Red) / (NIR + Red)</code>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161922] border border-gray-800 space-y-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Polygon Smart Contract Hash Traceability
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Every token minting and transfer action generates an immutable 64-character hex hash linkable to Polygon Amoy Explorer for full transparency.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide mb-3">Frequently Asked Questions</h3>

                <div className="p-3.5 rounded-xl bg-[#161922] border border-gray-800 space-y-1">
                  <h4 className="text-xs font-bold text-white">How is the carbon score computed?</h4>
                  <p className="text-xs text-gray-400">
                    It combines land surface area (hectares computed via Turf.js polygon topology) with normalized NDVI satellite vegetation density and crop-specific biomass baseline indices.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161922] border border-gray-800 space-y-1">
                  <h4 className="text-xs font-bold text-white">What currency is used for transactions?</h4>
                  <p className="text-xs text-gray-400">
                    All credit prices, listings, totals, and transaction records are represented in Indian Rupees (₹).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161922] border border-gray-800 space-y-1">
                  <h4 className="text-xs font-bold text-white">Is a real crypto wallet required to test?</h4>
                  <p className="text-xs text-gray-400">
                    No! The platform features an integrated server-signed testnet relay that handles Polygon Amoy testnet contract interactions automatically without requiring MetaMask or gas setup.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#161922]">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Need quick assistance? Toggle between tabs above for role-specific guides.</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition"
            >
              Close Operating Manual
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
