import React, { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AssetType, HierarchySelection, MaintenanceType } from "./types";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./components/LandingPage";
import PreventiveMaintenanceComponent from "./components/PreventiveMaintenance";
import ReactiveMaintenanceComponent from "./components/ReactiveMaintenance";
import CurrentRepairStateComponent from "./components/CurrentRepairState";
import ArmyHeader from "./components/ArmyHeader";
import Login from "./components/Login";
import { Card, CardContent } from "@/components/ui/card";

type AppState = "landing" | "preventive" | "reactive" | "current-repair";

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [currentAsset, setCurrentAsset] = useState<AssetType>("generator");
  const [selectedHierarchy, setSelectedHierarchy] =
    useState<HierarchySelection | null>(null);

  const handleAssetSelect = (
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
      <ArmyHeader
        title={getPageTitle()}
        showLogout={true}
        onLogout={() => navigate("/login", { replace: true })}
      />

      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Login
            onLogin={(user) => {
              login(user);
              navigate("/dashboard", { replace: true });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContent />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
