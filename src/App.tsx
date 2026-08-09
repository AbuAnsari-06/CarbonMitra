import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FarmerDashboard } from './components/FarmerDashboard';
import { Marketplace } from './components/Marketplace';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AuditorView } from './components/AuditorView';
import { BlockchainExplorerModal } from './components/BlockchainExplorerModal';
import { HelpManualModal } from './components/HelpManualModal';
import { ToastContainer } from './components/ToastContainer';
import { landService, creditService } from './services';
import { UserRole, Land, CarbonEstimate, CarbonCredit, TransactionRecord, GeoPoint } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [farmerName, setFarmerName] = useState<string>('Gurpreet Singh');
  const [buyerName, setBuyerName] = useState<string>('GreenTech ESG Global Corp');

  const [lands, setLands] = useState<Land[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isHelpManualOpen, setIsHelpManualOpen] = useState<boolean>(false);

  // Fetch initial data from API services
  const loadData = async () => {
    try {
      const [lData, cData, tData] = await Promise.all([
        landService.getLands(),
        creditService.getCredits(),
        creditService.getTransactions()
      ]);

      setLands(lData.lands || []);
      setCredits(cData.credits || []);
      setTransactions(tData.transactions || []);
    } catch (err) {
      console.error('Error loading data from backend server:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // API wrappers
  const handleRegisterLand = async (landData: any): Promise<Land> => {
    const data = await landService.registerLand(landData);
    setLands(prev => [data.land, ...prev]);
    return data.land;
  };

  const handleFetchNDVI = async (landId: string, coords: GeoPoint[]): Promise<CarbonEstimate> => {
    const data = await landService.fetchNDVI({ landId, polygonCoords: coords });

    const est: CarbonEstimate = {
      ...data.estimate,
      dataSource: (data as any).source || 'sentinel-2-l2a',
      rateLimitRemaining: (data as any).rateLimitRemaining || 10,
    };

    return est;
  };

  const handleMintCredit = async (creditData: any): Promise<any> => {
    const data = await creditService.mintCredit(creditData);
    setCredits(prev => [data.credit, ...prev]);
    return data;
  };

  const handleListCredit = async (creditId: string, pricePerTonINR: number): Promise<void> => {
    const data = await creditService.listCredit({ creditId, pricePerTonINR });
    setCredits(prev => prev.map(c => c.id === creditId ? data.credit : c));
  };

  const handleBuyCredit = async (creditId: string, buyerNameStr: string): Promise<any> => {
    const data = await creditService.buyCredit({ creditId, buyerName: buyerNameStr, buyerUid: 'buyer-99' });
    setCredits(prev => prev.map(c => c.id === creditId ? data.credit : c));
    setTransactions(prev => [data.transaction, ...prev]);
    return data;
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-gray-100 flex flex-col font-sans">
      <ToastContainer />
      
      {/* Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'farmer') setActiveTab('dashboard');
          if (role === 'buyer') setActiveTab('marketplace');
          if (role === 'auditor') setActiveTab('audit');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExplorer={() => setIsExplorerOpen(true)}
        onOpenHelpManual={() => setIsHelpManualOpen(true)}
        farmerName={farmerName}
        buyerName={buyerName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRole}-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {currentRole === 'farmer' && activeTab === 'dashboard' && (
              <FarmerDashboard
                farmerName={farmerName}
                lands={lands}
                credits={credits}
                onRegisterLand={handleRegisterLand}
                onFetchNDVI={handleFetchNDVI}
                onMintCredit={handleMintCredit}
                onListCredit={handleListCredit}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}

            {(activeTab === 'marketplace') && (
              <Marketplace
                credits={credits}
                buyerName={buyerName}
                onBuyCredit={handleBuyCredit}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}

            {currentRole === 'buyer' && activeTab === 'portfolio' && (
              <BuyerDashboard
                buyerName={buyerName}
                credits={credits}
                transactions={transactions}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}

            {currentRole === 'auditor' && (activeTab === 'audit' || activeTab === 'dashboard') && (
              <AuditorView
                lands={lands}
                credits={credits}
                transactions={transactions}
                onOpenExplorer={() => setIsExplorerOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Modals & Overlays */}
      <BlockchainExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        credits={credits}
        transactions={transactions}
      />

      <HelpManualModal
        isOpen={isHelpManualOpen}
        onClose={() => setIsHelpManualOpen(false)}
      />

    </div>
  );
}
