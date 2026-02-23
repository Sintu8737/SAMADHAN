import React, { useMemo, useState } from "react";
import { AssetType, HierarchySelection, MaintenanceType } from "../types";
import {
  mockCurrentRepairState,
  mockOrganizations,
  mockPreventiveMaintenance,
  mockReactiveMaintenance,
} from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Droplets, Settings } from "lucide-react";

interface LandingPageProps {
  onAssetSelect: (
    asset: AssetType,
    maintenance: MaintenanceType,
    hierarchy: HierarchySelection,
  ) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAssetSelect }) => {
  const { user } = useAuth();
  const [corpsId, setCorpsId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [brigadeId, setBrigadeId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [showHierarchyError, setShowHierarchyError] = useState(false);

  const corpsOptions = useMemo(
    () => mockOrganizations.filter((node) => node.level === "corps"),
    [],
  );

  const divisionOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (node) => node.level === "division" && node.parentId === corpsId,
      ),
    [corpsId],
  );

  const brigadeOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (node) => node.level === "brigade" && node.parentId === divisionId,
      ),
    [divisionId],
  );

  const unitOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (node) => node.level === "unit" && node.parentId === brigadeId,
      ),
    [brigadeId],
  );

  const handleCorpsChange = (value: string) => {
    setCorpsId(value);
    setDivisionId("");
    setBrigadeId("");
    setUnitId("");
  };

  const handleDivisionChange = (value: string) => {
    setDivisionId(value);
    setBrigadeId("");
    setUnitId("");
  };

  const handleBrigadeChange = (value: string) => {
    setBrigadeId(value);
    setUnitId("");
  };

  const hierarchySelected = Boolean(
    corpsId && divisionId && brigadeId && unitId,
  );

  const currentHierarchy = hierarchySelected
    ? {
        corpsId,
        divisionId,
        brigadeId,
        unitId,
      }
    : null;

  const handleAssetClick = (asset: AssetType, maintenance: MaintenanceType) => {
    if (!currentHierarchy) {
      setShowHierarchyError(true);
      return;
    }

    setShowHierarchyError(false);
    onAssetSelect(asset, maintenance, currentHierarchy);
  };

  const selectedUnitReactive = useMemo(
    () =>
      mockReactiveMaintenance.filter(
        (entry) => entry.organizationId === unitId,
      ),
    [unitId],
  );

  const selectedUnitPreventive = useMemo(
    () =>
      mockPreventiveMaintenance.filter(
        (entry) => entry.organizationId === unitId,
      ),
    [unitId],
  );

  const selectedUnitCurrentRepairs = useMemo(
    () =>
      mockCurrentRepairState.filter((entry) => entry.organizationId === unitId),
    [unitId],
  );

  const topCriticalAssets = useMemo(() => {
    const criticalMap = new Map<
      string,
      {
        equipmentName: string;
        make: string;
        model: string;
        totalBreakdowns: number;
        totalCost: number;
        totalDaysElapsed: number;
        overdueCount: number;
        score: number;
      }
    >();

    const upsert = (
      equipmentId: string,
      payload: {
        equipmentName: string;
        make: string;
        model: string;
      },
    ) => {
      if (!criticalMap.has(equipmentId)) {
        criticalMap.set(equipmentId, {
          equipmentName: payload.equipmentName,
          make: payload.make,
          model: payload.model,
          totalBreakdowns: 0,
          totalCost: 0,
          totalDaysElapsed: 0,
          overdueCount: 0,
          score: 0,
        });
      }
      return criticalMap.get(equipmentId)!;
    };

    for (const reactive of selectedUnitReactive) {
      const item = upsert(reactive.equipment.id, {
        equipmentName: reactive.equipment.name,
        make: reactive.equipment.make,
        model: reactive.equipment.model,
      });
      item.totalBreakdowns += reactive.totalBreakdowns;
      item.totalCost += reactive.totalCost;
    }

    for (const preventive of selectedUnitPreventive) {
      const item = upsert(preventive.equipment.id, {
        equipmentName: preventive.equipment.name,
        make: preventive.equipment.make,
        model: preventive.equipment.model,
      });

      const quarterlyStates = [
        preventive.qtr1.status,
        preventive.qtr2.status,
        preventive.qtr3.status,
        preventive.qtr4.status,
      ];

      item.overdueCount += quarterlyStates.filter(
        (status) => status === "overdue",
      ).length;
    }

    for (const repair of selectedUnitCurrentRepairs) {
      const item = upsert(repair.equipment.id, {
        equipmentName: repair.equipment.name,
        make: repair.equipment.make,
        model: repair.equipment.model,
      });
      item.totalDaysElapsed = Math.max(
        item.totalDaysElapsed,
        repair.totalDaysElapsed,
      );
    }

    return Array.from(criticalMap.values())
      .map((item) => ({
        ...item,
        score:
          item.totalBreakdowns * 3 +
          item.overdueCount * 4 +
          Math.round(item.totalCost / 5000) +
          Math.ceil(item.totalDaysElapsed / 5),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
  }, [
    selectedUnitCurrentRepairs,
    selectedUnitPreventive,
    selectedUnitReactive,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              Logged in role: {user?.role ?? "unknown"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>Corps</Label>
              <Select
                value={corpsId || undefined}
                onValueChange={handleCorpsChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Corps" />
                </SelectTrigger>
                <SelectContent>
                  {corpsOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={divisionId || undefined}
                onValueChange={handleDivisionChange}
                disabled={!corpsId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {divisionOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Brigade (Bde)</Label>
              <Select
                value={brigadeId || undefined}
                onValueChange={handleBrigadeChange}
                disabled={!divisionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brigade" />
                </SelectTrigger>
                <SelectContent>
                  {brigadeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={unitId || undefined}
                onValueChange={setUnitId}
                disabled={!brigadeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showHierarchyError && (
        <Alert variant="destructive">
          <AlertDescription>
            Please select all hierarchy levels before proceeding.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">GENR (Generators)</CardTitle>
              <Badge variant="secondary">Power Systems</Badge>
            </div>
            <CardDescription>
              Power generation equipment maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Maintenance Actions</span>
            </div>
            <Button
              className="w-full"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("generator", "preventive")}
            >
              Preventive Maintenance
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("generator", "reactive")}
            >
              Reactive Maintenance
            </Button>
            <Button
              className="w-full"
              variant="outline"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("generator", "current-repair")}
            >
              Current Repair State
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">WSS Pumps</CardTitle>
              <Badge variant="secondary">Water Systems</Badge>
            </div>
            <CardDescription>Water supply system maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">Maintenance Actions</span>
            </div>
            <Button
              className="w-full"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("wss-pumps", "preventive")}
            >
              Preventive Maintenance
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("wss-pumps", "reactive")}
            >
              Reactive Maintenance
            </Button>
            <Button
              className="w-full"
              variant="outline"
              disabled={!hierarchySelected}
              onClick={() => handleAssetClick("wss-pumps", "current-repair")}
            >
              Current Repair State
            </Button>
          </CardContent>
        </Card>
      </div>

      {hierarchySelected && (
        <Card>
          <CardHeader>
            <CardTitle>Top Critical Assets</CardTitle>
            <CardDescription>
              Ranked by breakdown frequency, overdue preventive maintenance,
              repair elapsed days, and repair cost.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead className="text-center">Breakdowns</TableHead>
                  <TableHead className="text-center">PM Overdue</TableHead>
                  <TableHead className="text-center">Repair Days</TableHead>
                  <TableHead className="text-right">Repair Cost</TableHead>
                  <TableHead className="text-center">Criticality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCriticalAssets.map((asset, index) => (
                  <TableRow key={`${asset.equipmentName}-${asset.model}`}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{asset.equipmentName}</TableCell>
                    <TableCell>
                      {asset.make} / {asset.model}
                    </TableCell>
                    <TableCell className="text-center">
                      {asset.totalBreakdowns}
                    </TableCell>
                    <TableCell className="text-center">
                      {asset.overdueCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {asset.totalDaysElapsed}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{asset.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          asset.score >= 12
                            ? "destructive"
                            : asset.score >= 8
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {asset.score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LandingPage;
