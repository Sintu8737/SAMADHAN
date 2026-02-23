import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetType, HierarchySelection, Repair } from "../types";
import { mockReactiveMaintenance } from "../data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReactiveMaintenanceProps {
  assetType: AssetType;
  selectedHierarchy: HierarchySelection | null;
  onBack: () => void;
}

const ReactiveMaintenanceComponent: React.FC<ReactiveMaintenanceProps> = ({
  assetType,
  selectedHierarchy,
  onBack,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [repairWindow, setRepairWindow] = useState("all");

  const maintenanceData = useMemo(
    () =>
      mockReactiveMaintenance.filter(
        (record) =>
          record.equipment.assetType === assetType &&
          (!selectedHierarchy ||
            record.organizationId === selectedHierarchy.unitId),
      ),
    [assetType, selectedHierarchy],
  );

  const filteredEquipment = maintenanceData.map((record) => record.equipment);

  const getRepairsInWindow = (repairs: Repair[]) => {
    if (repairWindow === "all") return repairs;

    const months = Number(repairWindow);
    const latestRepairDate = repairs.reduce((latest, repair) => {
      const current = new Date(repair.date);
      return current > latest ? current : latest;
    }, new Date(0));

    const cutoff = new Date(latestRepairDate);
    cutoff.setMonth(cutoff.getMonth() - months);

    return repairs.filter((repair) => new Date(repair.date) >= cutoff);
  };

  const filteredData = maintenanceData
    .filter(
      (record) =>
        !selectedEquipment || record.equipment.id === selectedEquipment,
    )
    .map((record) => {
      const repairs = getRepairsInWindow(record.repairs).slice(0, 3);
      const totalCost = repairs.reduce((sum, repair) => sum + repair.cost, 0);
      return {
        ...record,
        repairs,
        totalCost,
      };
    });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getRepairDisplay = (repairs: Repair[], index: number) => {
    if (index >= repairs.length) {
      return <span className="text-muted-foreground">-</span>;
    }

    const repair = repairs[index];
    return (
      <div className="space-y-1 text-xs">
        <p className="font-medium">{formatDate(repair.date)}</p>
        <p className="text-muted-foreground">{repair.description}</p>
        <Badge variant="outline">₹{repair.cost.toLocaleString()}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Assets
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {assetType === "generator" ? "Generator" : "WSS Pump"} Reactive
            Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Equipment</label>
            <Select
              value={selectedEquipment || "all"}
              onValueChange={(value) =>
                setSelectedEquipment(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {filteredEquipment.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.make} {equipment.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Repair Window</label>
            <Select value={repairWindow} onValueChange={setRepairWindow}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Repair 1</TableHead>
                <TableHead>Repair 2</TableHead>
                <TableHead>Repair 3</TableHead>
                <TableHead className="text-center">
                  Breakdowns (in days)
                </TableHead>
                <TableHead className="text-right">
                  Lifetime Repair Cost
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record, index) => (
                <TableRow key={record.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {record.equipment.name}
                  </TableCell>
                  <TableCell>{record.equipment.make}</TableCell>
                  <TableCell>{record.equipment.model}</TableCell>
                  <TableCell>{getRepairDisplay(record.repairs, 0)}</TableCell>
                  <TableCell>{getRepairDisplay(record.repairs, 1)}</TableCell>
                  <TableCell>{getRepairDisplay(record.repairs, 2)}</TableCell>
                  <TableCell className="text-center font-medium">
                    {record.totalBreakdowns}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{record.totalCost.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No reactive maintenance data available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReactiveMaintenanceComponent;
