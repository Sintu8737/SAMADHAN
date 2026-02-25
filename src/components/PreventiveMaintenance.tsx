import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetType, HierarchySelection, PreventiveQuarter } from "../types";
import {
  mockEquipment,
  mockPreventiveMaintenance,
  getRelevantOrgIds,
  getOrgName,
} from "../data/mockData";
import EquipmentInfoDialog from "./EquipmentInfoDialog";
import PMStatsChart from "./PMStatsChart";
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

interface PreventiveMaintenanceProps {
  assetType: AssetType;
  selectedHierarchy: HierarchySelection | null;
  onBack: () => void;
}

const PreventiveMaintenanceComponent: React.FC<PreventiveMaintenanceProps> = ({
  assetType,
  selectedHierarchy,
  onBack,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [expandedEquipmentId, setExpandedEquipmentId] = useState<string | null>(
    null,
  );

  const defaultQuarters: PreventiveQuarter[] = [
    { quarter: "Q1", status: "pending" },
    { quarter: "Q2", status: "pending" },
    { quarter: "Q3", status: "pending" },
    { quarter: "Q4", status: "pending" },
  ];

  const relevantOrgIds = useMemo(
    () => (selectedHierarchy ? getRelevantOrgIds(selectedHierarchy) : []),
    [selectedHierarchy],
  );

  const unitEquipment = useMemo(
    () =>
      mockEquipment.filter(
        (equipment) =>
          equipment.assetType === assetType &&
          (relevantOrgIds.length === 0 ||
            relevantOrgIds.includes(equipment.organizationId)),
      ),
    [assetType, relevantOrgIds],
  );

  const maintenanceData = useMemo(
    () =>
      unitEquipment.map((equipment) => {
        const existingRecord = mockPreventiveMaintenance.find(
          (record) =>
            record.equipment.id === equipment.id &&
            record.organizationId === equipment.organizationId,
        );

        if (existingRecord) {
          return existingRecord;
        }

        return {
          id: `pm-missing-${equipment.id}`,
          organizationId: equipment.organizationId,
          equipment,
          quarters: defaultQuarters,
        };
      }),
    [defaultQuarters, unitEquipment],
  );

  const filteredEquipment = maintenanceData.map((record) => record.equipment);

  const filteredData = maintenanceData.filter(
    (record) => !selectedEquipment || record.equipment.id === selectedEquipment,
  );

  const getStatusBadge = (status: "completed" | "pending" | "overdue") => {
    if (status === "completed") {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>
      );
    }
    if (status === "pending") {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
    }
    return <Badge variant="destructive">Overdue</Badge>;
  };

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

      <Card>
        <CardHeader>
          <CardTitle>
            {assetType === "generator" ? "Generator" : "WSS Pump"} Preventive
            Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
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
        </CardContent>
      </Card>

      <PMStatsChart maintenanceData={filteredData} />

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record, index) => {
                const isExpanded = expandedEquipmentId === record.equipment.id;

                return (
                  <React.Fragment key={record.id}>
                    <TableRow
                      className="cursor-pointer"
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
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Quarter</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Completion Date</TableHead>
                                  <TableHead>Comments</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {record.quarters.map((quarterData) => (
                                  <TableRow
                                    key={`${record.id}-${quarterData.quarter}`}
                                  >
                                    <TableCell className="font-medium">
                                      {quarterData.quarter}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(quarterData.status)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {quarterData.date || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {quarterData.comment || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
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
              No preventive maintenance data available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreventiveMaintenanceComponent;
