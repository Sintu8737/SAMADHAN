import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AssetType, HierarchySelection, MaintenanceType } from "./types";
import LandingPage from "./components/LandingPage";
import PreventiveMaintenanceComponent from "./components/PreventiveMaintenance";
import ReactiveMaintenanceComponent from "./components/ReactiveMaintenance";
import CurrentRepairStateComponent from "./components/CurrentRepairState";
import ArmyHeader from "./components/ArmyHeader";

type AppState = "landing" | "preventive" | "reactive" | "current-repair";

const DashboardContent: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [currentAsset, setCurrentAsset] = useState<AssetType>("generator");
  const [selectedHierarchy, setSelectedHierarchy] =
    useState<HierarchySelection | null>(null);

  const navigateToMaintenance = (
    asset: AssetType,
    maintenance: MaintenanceType,
    hierarchy: HierarchySelection,
  ) => {
    setCurrentAsset(asset);
    setSelectedHierarchy(hierarchy);

    switch (maintenance) {
      case "preventive":
        setCurrentState("preventive");
        break;
      case "reactive":
        setCurrentState("reactive");
        break;
      case "current-repair":
        setCurrentState("current-repair");
        break;
    }
  };

  const handleAssetSelect = (
    asset: AssetType,
    maintenance: MaintenanceType,
    hierarchy: HierarchySelection,
  ) => {
    navigateToMaintenance(asset, maintenance, hierarchy);
  };

  const handleBack = () => {
    setCurrentState("landing");
  };

  const getPageTitle = () => {
    switch (currentState) {
      case "landing":
        return "";
      case "preventive":
        return `${currentAsset === "generator" ? "Generators" : "WSS Pumps"} - Preventive Maintenance`;
      case "reactive":
        return `${currentAsset === "generator" ? "Generators" : "WSS Pumps"} - Reactive Maintenance`;
      case "current-repair":
        return `${currentAsset === "generator" ? "Generators" : "WSS Pumps"} - Current Repair Status`;
      default:
        return "";
    }
  };

  const renderCurrentPage = () => {
    switch (currentState) {
      case "landing":
        return <LandingPage onAssetSelect={handleAssetSelect} />;

      case "preventive":
        return (
          <PreventiveMaintenanceComponent
            assetType={currentAsset}
            selectedHierarchy={selectedHierarchy}
            onBack={handleBack}
          />
        );

      case "reactive":
        return (
          <ReactiveMaintenanceComponent
            assetType={currentAsset}
            selectedHierarchy={selectedHierarchy}
            onBack={handleBack}
          />
        );

      case "current-repair":
        return (
          <CurrentRepairStateComponent
            assetType={currentAsset}
            selectedHierarchy={selectedHierarchy}
            onBack={handleBack}
          />
        );

      default:
        return <LandingPage onAssetSelect={handleAssetSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <ArmyHeader title={getPageTitle()} />

      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardContent />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
