import React from "react";
import {
  Info,
  Cpu,
  Wrench,
  Hash,
  Clock,
  Calendar,
  Building2,
  Tag,
  IndianRupee,
  Zap,
  Droplets,
  Shield,
} from "lucide-react";
import { Equipment } from "../types";
import { getOrgName } from "../data/mockData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface EquipmentInfoDialogProps {
  equipment: Equipment;
}

const EquipmentInfoDialog: React.FC<EquipmentInfoDialogProps> = ({
  equipment,
}) => {
  const isGenerator = equipment.assetType === "generator";

  const accentColor = isGenerator ? "amber" : "blue";

  return (
    <span
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-blue-50"
          >
            <Info className="h-4 w-4 text-blue-500" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
          {/* Hero Header */}
          <div
            className={`relative px-8 pt-8 pb-6 ${
              isGenerator
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-blue-500 to-cyan-600"
            }`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-6">
                {isGenerator ? (
                  <Zap className="h-24 w-24 text-white" />
                ) : (
                  <Droplets className="h-24 w-24 text-white" />
                )}
              </div>
            </div>

            <DialogHeader className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                  {isGenerator ? (
                    <Zap className="h-7 w-7 text-white" />
                  ) : (
                    <Droplets className="h-7 w-7 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">
                    {equipment.name}
                  </DialogTitle>
                  <p className="text-sm text-white/80 mt-1">
                    {equipment.make} &middot; {equipment.model}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {getOrgName(equipment.organizationId)}
                    </Badge>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {isGenerator ? "Generator" : "WSS Pump"}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Stat Cards Row */}
          <div className="px-6 -mt-4 relative z-20">
            <div className="grid grid-cols-3 gap-3">
              {/* Cost */}
              <div className="rounded-xl bg-white border shadow-sm p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Cost
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-700">
                  ₹{(equipment.cost / 1000).toFixed(0)}K
                </p>
              </div>

              {/* Running Hours or Serial */}
              {isGenerator &&
              typeof equipment.runningHoursLifetime === "number" ? (
                <div className="rounded-xl bg-white border shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Run Hours
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {(equipment.runningHoursLifetime / 1000).toFixed(1)}K
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-white border shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Serial
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {equipment.serialNumber}
                  </p>
                </div>
              )}

              {/* Vintage */}
              {isGenerator &&
              typeof equipment.manufacturingYear === "number" ? (
                <div className="rounded-xl bg-white border shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Vintage
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">
                    {equipment.manufacturingYear}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-white border shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Type
                    </span>
                  </div>
                  <p className="text-sm font-bold text-purple-700">
                    {isGenerator ? "Generator" : "Pump"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 pt-5 pb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Equipment Specifications
            </h4>
            <div className="space-y-1">
              {[
                { icon: Wrench, label: "Make", value: equipment.make },
                { icon: Cpu, label: "Model", value: equipment.model },
                {
                  icon: Hash,
                  label: isGenerator ? "Registration No." : "Serial No.",
                  value: equipment.serialNumber,
                },
                ...(isGenerator
                  ? [
                      {
                        icon: Clock,
                        label: "Running Hours (Lifetime)",
                        value:
                          typeof equipment.runningHoursLifetime === "number"
                            ? `${equipment.runningHoursLifetime.toLocaleString("en-IN")} hrs`
                            : "—",
                      },
                      {
                        icon: Calendar,
                        label: "Vintage / Mfg Year",
                        value:
                          typeof equipment.manufacturingYear === "number"
                            ? `${equipment.manufacturingYear}`
                            : "—",
                      },
                    ]
                  : []),
                {
                  icon: Building2,
                  label: "Unit",
                  value: getOrgName(equipment.organizationId),
                },
                {
                  icon: IndianRupee,
                  label: "Equipment Cost",
                  value: `₹${equipment.cost.toLocaleString("en-IN")}`,
                },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    idx % 2 === 0 ? "bg-muted/40" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                      isGenerator
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </span>
  );
};

export default EquipmentInfoDialog;
