import React from "react";
import { useNavigate } from "react-router-dom";
import ArmyHeader from "./ArmyHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SparePartsDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <ArmyHeader title="Spare Parts Dashboard" />
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-2xl font-semibold text-muted-foreground">
            Spare Parts Dashboard
          </p>
        </div>
      </main>
    </div>
  );
};

export default SparePartsDashboard;
