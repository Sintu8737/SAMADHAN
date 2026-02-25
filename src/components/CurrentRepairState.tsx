import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetType, HierarchySelection, UserRole } from "../types";
import {
  mockCurrentRepairState,
  mockReactiveRepairWorkflows,
  getRelevantOrgIds,
  getOrgName,
} from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import EquipmentInfoDialog from "./EquipmentInfoDialog";
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

interface CurrentRepairStateProps {
  assetType: AssetType;
  selectedHierarchy: HierarchySelection | null;
  onBack: () => void;
}

const CurrentRepairStateComponent: React.FC<CurrentRepairStateProps> = ({
  assetType,
  selectedHierarchy,
  onBack,
}) => {
  const { user } = useAuth();
  const [selectedEquipment, setSelectedEquipment] = useState("");

  const role = user?.role ?? "unit";

  const relevantOrgIds = useMemo(
    () => (selectedHierarchy ? getRelevantOrgIds(selectedHierarchy) : []),
    [selectedHierarchy],
  );

  const repairData = useMemo(
    () =>
      mockCurrentRepairState.filter(
        (record) =>
          record.equipment.assetType === assetType &&
          (relevantOrgIds.length === 0 ||
            relevantOrgIds.includes(record.organizationId)),
      ),
    [assetType, relevantOrgIds],
  );

  const workflowMap = useMemo(() => {
    return new Map(
      mockReactiveRepairWorkflows.map((workflow) => [
        `${workflow.organizationId}-${workflow.equipment.id}`,
        workflow,
      ]),
    );
  }, []);

  const roleFilteredData = useMemo(() => {
    if (role === "admin") {
      return repairData;
    }

    return repairData.filter((record) => {
      const workflow = workflowMap.get(
        `${record.organizationId}-${record.equipment.id}`,
      );
      if (!workflow) {
        return false;
      }
      return workflow.history.some((history) => history.role === role);
    });
  }, [repairData, role, workflowMap]);

  const filteredData = roleFilteredData.filter(
    (record) => !selectedEquipment || record.equipment.id === selectedEquipment,
  );

  const equipmentOptions = useMemo(() => {
    return Array.from(
      new Map(
        roleFilteredData.map((record) => [
          record.equipment.id,
          record.equipment,
        ]),
      ).values(),
    );
  }, [roleFilteredData]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getElapsedBadge = (days: number) => {
    if (days <= 7) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">
          {days} days
        </Badge>
      );
    }
    if (days <= 14) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600">{days} days</Badge>
      );
    }
    return <Badge variant="destructive">{days} days</Badge>;
  };

  const getMyRoleStatus = (
    organizationId: string,
    equipmentId: string,
    currentStage: string,
  ) => {
    if (role === "admin") {
      return "Monitoring";
    }

    const workflow = workflowMap.get(`${organizationId}-${equipmentId}`);
    if (!workflow) {
      return "N/A";
    }

    const roleEntry = workflow.history.find((history) => history.role === role);
    if (!roleEntry) {
      return "Not Involved";
    }

    if (
      workflow.currentStage === mapRoleToStage(role) &&
      roleEntry.status !== "completed"
    ) {
      return "Action Required";
    }

    return roleEntry.status;
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
            {assetType === "generator" ? "Generator" : "WSS Pump"} Current
            Repair State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="outline">Role View: {role}</Badge>
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
                {equipmentOptions.map((equipment) => (
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
                <TableHead>Unit</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Defect</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>WO FWD by UNIT</TableHead>
                <TableHead>WO to EME BN</TableHead>
                <TableHead>Noting order</TableHead>
                <TableHead>RO by Div HQ</TableHead>
                <TableHead>SO by Engr Rgt</TableHead>
                <TableHead>Vendor PDC</TableHead>
                <TableHead>My Role Status</TableHead>
                <TableHead>Elapsed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record, index) => (
                <TableRow key={record.id}>
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
                  <TableCell>{record.defect}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.currentStage}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(record.woFwdToEMEBN)}</TableCell>
                  <TableCell>{formatDate(record.roReleasedByDivHQ)}</TableCell>
                  <TableCell>{formatDate(record.soPlannedByEngrRgt)}</TableCell>
                  <TableCell>{formatDate(record.vendorPDC)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getMyRoleStatus(
                        record.organizationId,
                        record.equipment.id,
                        record.currentStage,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getElapsedBadge(record.totalDaysElapsed)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No current repair data available for this role and selected
              hierarchy.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function mapRoleToStage(role: UserRole) {
  switch (role) {
    case "unit":
      return "unit";
    case "workshop":
      return "workshop";
    case "eme-battalion":
      return "eme-battalion";
    case "div-hq":
      return "div-hq";
    case "engineer-regiment":
      return "engineer-regiment";
    default:
      return "repair-complete";
  }
}

export default CurrentRepairStateComponent;
