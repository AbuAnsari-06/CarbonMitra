import React from 'react';
import { UserRole } from '../types';
import { Sprout, ShoppingBag, ShieldCheck, Cpu, ExternalLink, Leaf, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExplorer: () => void;
  onOpenHelpManual: () => void;
  farmerName: string;
  buyerName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  onOpenExplorer,
  onOpenHelpManual,
  farmerName,
  buyerName
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0d0e12]/95 backdrop-blur-md border-b border-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center">
                  <span><span className="text-xl font-extrabold text-white">C</span>arbon</span>
                  <span className="text-emerald-400 ml-0.5"><span className="text-xl font-extrabold text-emerald-400">M</span>itra</span>
                </span>
              </div>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#15171e] p-1 rounded-xl border border-gray-800">
            {currentRole === 'farmer' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-gray-800 text-emerald-400 border border-gray-700/80 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Farmland & Carbon Assets</span>
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'marketplace'
                      ? 'bg-gray-800 text-emerald-400 border border-gray-700/80 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Marketplace</span>
                </button>
              </>
            )}

            {currentRole === 'buyer' && (
              <>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'marketplace'
                      ? 'bg-gray-800 text-indigo-400 border border-gray-700/80 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Browse Credits</span>
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'portfolio'
                      ? 'bg-gray-800 text-indigo-400 border border-gray-700/80 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ESG Offset Portfolio</span>
                </button>
              </>
            )}

            {currentRole === 'auditor' && (
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'audit'
                    ? 'bg-gray-800 text-amber-400 border border-gray-700/80 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Satellite Audit Registry</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls & Role Switcher */}
          <div className="flex items-center space-x-2.5">
            
            {/* User Manual Button */}
            <button
              onClick={onOpenHelpManual}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              title="Open Platform User & Operating Manual"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">User Manual</span>
            </button>

            {/* Blockchain Inspector Link */}
            <button
              onClick={onOpenExplorer}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-mono transition-all"
              title="View Smart Contract Ledger"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Ledger Explorer</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-[#15171e] p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => {
                  onRoleChange('farmer');
                  setActiveTab('dashboard');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Farmer
              </button>

              <button
                onClick={() => {
                  onRoleChange('buyer');
                  setActiveTab('marketplace');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'buyer'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Corporate Buyer
              </button>

              <button
                onClick={() => {
                  onRoleChange('auditor');
                  setActiveTab('audit');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'auditor'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Auditor
              </button>
            </div>

            {/* Active Account Indicator */}
            <div className="hidden xl:flex items-center space-x-2 pl-2 border-l border-gray-800 text-xs text-gray-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="font-mono text-gray-200 truncate max-w-[110px]">
                {currentRole === 'farmer' ? farmerName : currentRole === 'buyer' ? buyerName : 'Auditor'}
              </span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
