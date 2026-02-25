import React, { useMemo, useState } from "react";
import { AssetType, HierarchySelection, MaintenanceType } from "../types";
import { mockOrganizations } from "../data/mockData";
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

  const hierarchySelected = Boolean(corpsId);

  const currentHierarchy: HierarchySelection | null = corpsId
    ? {
        corpsId,
        ...(divisionId && { divisionId }),
        ...(brigadeId && { brigadeId }),
        ...(unitId && { unitId }),
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Selection</CardTitle>
          <CardDescription>
            Select Corps to view all resources. Narrow down by Division,
            Brigade, or Unit for detailed views.
          </CardDescription>
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
                  {!divisionId ? (
                    <SelectItem value="__select-division" disabled>
                      Select Division first
                    </SelectItem>
                  ) : brigadeOptions.length === 0 ? (
                    <SelectItem value="__no-brigade" disabled>
                      No brigades available
                    </SelectItem>
                  ) : (
                    brigadeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))
                  )}
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
                  {!brigadeId ? (
                    <SelectItem value="__select-brigade" disabled>
                      Select Brigade first
                    </SelectItem>
                  ) : unitOptions.length === 0 ? (
                    <SelectItem value="__no-unit" disabled>
                      No units available
                    </SelectItem>
                  ) : (
                    unitOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showHierarchyError && (
        <Alert variant="destructive">
          <AlertDescription>
            Please select at least Corps before proceeding.
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
    </div>
  );
};

export default LandingPage;
