import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetType, HierarchySelection } from "../types";
import { mockPreventiveMaintenance } from "../data/mockData";
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

  const maintenanceData = useMemo(
    () =>
      mockPreventiveMaintenance.filter(
        (record) =>
          record.equipment.assetType === assetType &&
          (!selectedHierarchy ||
            record.organizationId === selectedHierarchy.unitId),
      ),
    [assetType, selectedHierarchy],
  );

  const filteredEquipment = maintenanceData.map((record) => record.equipment);

  const filteredData = maintenanceData.filter(
    (record) => !selectedEquipment || record.equipment.id === selectedEquipment,
  );

  const getStatusBadge = (
    status: "completed" | "pending" | "overdue",
    date?: string,
  ) => {
    if (status === "completed") {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">
          {date ? `Completed (${date})` : "Completed"}
        </Badge>
      );
    }
    if (status === "pending") {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
    }
    return <Badge variant="destructive">Overdue</Badge>;
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

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Q1</TableHead>
                <TableHead>Q2</TableHead>
                <TableHead>Q3</TableHead>
                <TableHead>Q4</TableHead>
                <TableHead>Comments</TableHead>
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
                  <TableCell>
                    {getStatusBadge(record.qtr1.status, record.qtr1.date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.qtr2.status, record.qtr2.date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.qtr3.status, record.qtr3.date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.qtr4.status, record.qtr4.date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.comments || "-"}
                  </TableCell>
                </TableRow>
              ))}
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
