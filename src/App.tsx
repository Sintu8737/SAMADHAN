import React, { useState } from 'react';
import { AssetType, MaintenanceType } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import PreventiveMaintenanceComponent from './components/PreventiveMaintenance';
import ReactiveMaintenanceComponent from './components/ReactiveMaintenance';
import CurrentRepairStateComponent from './components/CurrentRepairState';
import LoginModal from './components/LoginModal';
import ArmyHeader from './components/ArmyHeader';
import './App.css';

type AppState = 'landing' | 'preventive' | 'reactive' | 'current-repair';

const AppContent: React.FC = () => {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [currentAsset, setCurrentAsset] = useState<AssetType>('generator');
  const [currentMaintenance, setCurrentMaintenance] = useState<MaintenanceType>('preventive');

  const handleAssetSelect = (asset: AssetType, maintenance: MaintenanceType) => {
    setCurrentAsset(asset);
    setCurrentMaintenance(maintenance);
    
    switch (maintenance) {
      case 'preventive':
        setCurrentState('preventive');
        break;
      case 'reactive':
        setCurrentState('reactive');
        break;
      case 'current-repair':
        setCurrentState('current-repair');
        break;
    }
  };

  const handleBack = () => {
    setCurrentState('landing');
  };

  const getPageTitle = () => {
    switch (currentState) {
      case 'landing':
        return 'Asset Management System';
      case 'preventive':
        return `${currentAsset === 'generator' ? 'Generators' : 'WSS Pumps'} - Preventive Maintenance`;
      case 'reactive':
        return `${currentAsset === 'generator' ? 'Generators' : 'WSS Pumps'} - Reactive Maintenance`;
      case 'current-repair':
        return `${currentAsset === 'generator' ? 'Generators' : 'WSS Pumps'} - Current Repair Status`;
      default:
        return 'Asset Management System';
    }
  };

  const renderCurrentPage = () => {
    switch (currentState) {
      case 'landing':
        return (
          <LandingPage
            onAssetSelect={handleAssetSelect}
          />
        );
      
      case 'preventive':
        return (
          <PreventiveMaintenanceComponent
            assetType={currentAsset}
            onBack={handleBack}
          />
        );
      
      case 'reactive':
        return (
          <ReactiveMaintenanceComponent
            assetType={currentAsset}
            onBack={handleBack}
          />
        );
      
      case 'current-repair':
        return (
          <CurrentRepairStateComponent
            assetType={currentAsset}
            onBack={handleBack}
          />
        );
      
      default:
        return (
          <LandingPage
            onAssetSelect={handleAssetSelect}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ArmyHeader 
        title={getPageTitle()} 
        showLogout={true}
      />
      
      <main style={{ flex: 1 }}>
        {renderCurrentPage()}
      </main>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
