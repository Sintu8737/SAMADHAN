import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Wrench, Package } from "lucide-react";

const DashboardSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 md:px-6">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide md:text-3xl">
              SAMADHAN
            </h1>
            <p className="text-xs text-muted-foreground/90 md:text-sm">
              Strategic Asset Management and Digital Handling of Assets Network
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Select Dashboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a module to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
              onClick={() => navigate("/maintenance")}
            >
              <CardHeader className="items-center text-center">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Wrench className="h-10 w-10" />
                </div>
                <CardTitle className="mt-2">Maintenance Dashboard</CardTitle>
                <CardDescription>
                  Preventive, reactive maintenance &amp; current repair status
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
              onClick={() => navigate("/spare-parts")}
            >
              <CardHeader className="items-center text-center">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Package className="h-10 w-10" />
                </div>
                <CardTitle className="mt-2">Spare Parts Dashboard</CardTitle>
                <CardDescription>
                  Spare parts inventory and management
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSelector;
