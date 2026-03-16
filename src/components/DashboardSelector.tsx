import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Wrench, Package, ArrowRight } from "lucide-react";

const DashboardSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-5">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl">
              SAMADHAN
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Strategic Asset Management and Digital Handling of Assets Network
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to SAMADHAN
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a dashboard to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Maintenance */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 px-10 py-14 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/60 hover:-translate-y-1"
              onClick={() => navigate("/maintenance")}
            >
              <div className="flex flex-col items-center text-center gap-5">
                <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 p-6 text-white shadow-lg shadow-blue-300/40 transition-transform duration-300 group-hover:scale-110">
                  <Wrench className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold">Maintenance</h3>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  Preventive, reactive &amp; current repair tracking
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>

            {/* Spare Parts */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 px-10 py-14 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100/60 hover:-translate-y-1"
              onClick={() => navigate("/spare-parts")}
            >
              <div className="flex flex-col items-center text-center gap-5">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-300/40 transition-transform duration-300 group-hover:scale-110">
                  <Package className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold">Spare Parts</h3>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  Inventory, stock levels &amp; deadstock analysis
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSelector;
