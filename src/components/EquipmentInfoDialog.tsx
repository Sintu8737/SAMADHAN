import React from "react";
import {
  Info,
  Cpu,
  Wrench,
  Hash,
  Building2,
  Tag,
  IndianRupee,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EquipmentInfoDialogProps {
  equipment: Equipment;
}

const EquipmentInfoDialog: React.FC<EquipmentInfoDialogProps> = ({
  equipment,
}) => {
  const isGenerator = equipment.assetType === "generator";

  const details = [
    { icon: Wrench, label: "Make", value: equipment.make },
    { icon: Cpu, label: "Model", value: equipment.model },
    { icon: Hash, label: "Serial Number", value: equipment.serialNumber },
    {
      icon: Tag,
      label: "Asset Type",
      value: isGenerator ? "Generator" : "WSS Pump",
      isBadge: true,
    },
    {
      icon: Building2,
      label: "Unit",
      value: getOrgName(equipment.organizationId),
    },
  ];

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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Header */}
          <div
            className={`px-6 pt-6 pb-4 ${
              isGenerator
                ? "bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100"
                : "bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-blue-100"
            }`}
          >
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isGenerator
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base">
                    {equipment.name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {equipment.make} &middot; {equipment.model}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Details Card */}
          <div className="px-4 pt-4 pb-2">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Equipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-0.5">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground min-w-[100px]">
                      {item.label}
                    </span>
                    {item.isBadge ? (
                      <Badge
                        variant="outline"
                        className={`ml-auto ${
                          isGenerator
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.value}
                      </Badge>
                    ) : (
                      <span className="text-sm font-medium ml-auto text-right">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cost Card */}
          <div className="px-4 pb-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Equipment Cost</span>
                </div>
                <span className="text-lg font-bold text-emerald-700">
                  ₹{equipment.cost.toLocaleString("en-IN")}
                </span>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </span>
  );
};

export default EquipmentInfoDialog;
