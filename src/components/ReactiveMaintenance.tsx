import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetType, HierarchySelection, Repair } from "../types";
import {
  mockReactiveMaintenance,
  getRelevantOrgIds,
  getOrgName,
} from "../data/mockData";
import EquipmentInfoDialog from "./EquipmentInfoDialog";
import RMStatsChart from "./RMStatsChart";
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
  const [expandedEquipmentId, setExpandedEquipmentId] = useState<string | null>(
    null,
  );

  const relevantOrgIds = useMemo(
    () => (selectedHierarchy ? getRelevantOrgIds(selectedHierarchy) : []),
    [selectedHierarchy],
  );

  const maintenanceData = useMemo(
    () =>
      mockReactiveMaintenance.filter(
        (record) =>
          record.equipment.assetType === assetType &&
          (relevantOrgIds.length === 0 ||
            relevantOrgIds.includes(record.organizationId)),
      ),
    [assetType, relevantOrgIds],
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
      const repairs = getRepairsInWindow(record.repairs);
      const totalCost = repairs.reduce((sum, repair) => sum + repair.cost, 0);
      const totalDowntime = repairs.reduce(
        (sum, repair) => sum + repair.downtime,
        0,
      );
      return {
        ...record,
        repairs,
        totalCost,
        filteredBreakdowns: repairs.length,
        filteredDowntime: totalDowntime,
      };
    });

  const maxBreakdowns = useMemo(
    () => Math.max(...filteredData.map((r) => r.filteredBreakdowns), 1),
    [filteredData],
  );

  const maxDowntime = useMemo(
    () => Math.max(...filteredData.map((r) => r.filteredDowntime), 1),
    [filteredData],
  );

  const maxCost = useMemo(
    () => Math.max(...filteredData.map((r) => r.totalCost), 1),
    [filteredData],
  );

  const getBreakdownHeatmap = (count: number) => {
    const ratio = count / maxBreakdowns;
    if (ratio >= 0.75)
      return { bg: "rgba(220, 38, 38, 0.15)", text: "text-red-700" };
    if (ratio >= 0.5)
      return { bg: "rgba(245, 158, 11, 0.13)", text: "text-amber-700" };
    if (ratio >= 0.25)
      return { bg: "rgba(234, 179, 8, 0.10)", text: "text-yellow-700" };
    return { bg: "rgba(34, 197, 94, 0.08)", text: "text-green-700" };
  };

  const getDowntimeHeatmap = (days: number) => {
    const ratio = days / maxDowntime;
    if (ratio >= 0.75)
      return { bg: "rgba(220, 38, 38, 0.15)", text: "text-red-700" };
    if (ratio >= 0.5)
      return { bg: "rgba(245, 158, 11, 0.13)", text: "text-amber-700" };
    if (ratio >= 0.25)
      return { bg: "rgba(234, 179, 8, 0.10)", text: "text-yellow-700" };
    return { bg: "rgba(34, 197, 94, 0.08)", text: "text-green-700" };
  };

  const getCostHeatmap = (cost: number) => {
    const ratio = cost / maxCost;
    if (ratio >= 0.75)
      return {
        bg: "rgba(220, 38, 38, 0.18)",
        text: "text-red-700",
        border: "border-l-2 border-red-500",
      };
    if (ratio >= 0.5)
      return {
        bg: "rgba(245, 158, 11, 0.16)",
        text: "text-amber-700",
        border: "border-l-2 border-amber-500",
      };
    if (ratio >= 0.25)
      return {
        bg: "rgba(234, 179, 8, 0.12)",
        text: "text-yellow-700",
        border: "border-l-2 border-yellow-400",
      };
    return {
      bg: "rgba(34, 197, 94, 0.10)",
      text: "text-green-700",
      border: "border-l-2 border-green-400",
    };
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const toggleExpandedEquipment = (equipmentId: string) => {
    setExpandedEquipmentId((current) =>
      current === equipmentId ? null : equipmentId,
    );
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Assets
      </Button>

      <RMStatsChart maintenanceData={maintenanceData} />

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
                <TableHead>Unit</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Breakdowns</TableHead>
                <TableHead className="text-center">
                  Total Downtime (days)
                </TableHead>
                <TableHead className="text-right">Total Repair Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record, index) => {
                const isExpanded = expandedEquipmentId === record.equipment.id;

                return (
                  <React.Fragment key={record.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        toggleExpandedEquipment(record.equipment.id)
                      }
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOrgName(record.organizationId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {record.equipment.name}
                          <EquipmentInfoDialog equipment={record.equipment} />
                        </div>
                      </TableCell>
                      <TableCell>{record.equipment.make}</TableCell>
                      <TableCell>{record.equipment.model}</TableCell>
                      <TableCell
                        className={`text-center font-semibold ${getBreakdownHeatmap(record.filteredBreakdowns).text}`}
                        style={{
                          backgroundColor: getBreakdownHeatmap(
                            record.filteredBreakdowns,
                          ).bg,
                        }}
                      >
                        {record.filteredBreakdowns}
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${getDowntimeHeatmap(record.filteredDowntime).text}`}
                        style={{
                          backgroundColor: getDowntimeHeatmap(
                            record.filteredDowntime,
                          ).bg,
                        }}
                      >
                        {record.filteredDowntime}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${getCostHeatmap(record.totalCost).text} ${getCostHeatmap(record.totalCost).border}`}
                        style={{
                          backgroundColor: getCostHeatmap(record.totalCost).bg,
                        }}
                      >
                        ₹{record.totalCost.toLocaleString()}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>S.No</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-center">
                                    Downtime (days)
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Cost
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {record.repairs.length > 0 ? (
                                  record.repairs.map((repair, rIndex) => (
                                    <TableRow key={repair.id}>
                                      <TableCell>{rIndex + 1}</TableCell>
                                      <TableCell className="font-medium">
                                        {formatDate(repair.date)}
                                      </TableCell>
                                      <TableCell>
                                        {repair.description}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {repair.downtime}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Badge variant="outline">
                                          ₹{repair.cost.toLocaleString()}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center text-muted-foreground"
                                    >
                                      No repairs in selected window
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
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
