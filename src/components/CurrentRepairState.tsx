import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Shield,
  Landmark,
  FileCheck,
  Truck,
  Wrench,
  PackageCheck,
  CircleCheckBig,
} from "lucide-react";
import {
  AssetType,
  CurrentRepairState,
  HierarchySelection,
  WorkflowStage,
} from "../types";
import {
  mockCurrentRepairState,
  mockReactiveRepairWorkflows,
  getRelevantOrgIds,
  getOrgName,
  getElapsedDays,
  computeCurrentStage,
} from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import EquipmentInfoDialog from "./EquipmentInfoDialog";
import CRSStatsChart from "./CRSStatsChart";
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

const FLOW_STAGES = [
  {
    key: "woFwdByUnit" as const,
    label: "WO FWD by Unit",
    shortLabel: "Work Order by Unit",
    icon: Send,
    description: "Unit raises Work Order and forwards to Workshop",
    actor: "Unit",
    stageThreshold: "unit" as WorkflowStage,
  },
  {
    key: "woToEMEBN" as const,
    label: "WO to EME BN",
    shortLabel: "Work Order → EME BN",
    icon: Building2,
    description: "Workshop forwards Work Order to EME Battalion",
    actor: "Workshop",
    stageThreshold: "workshop" as WorkflowStage,
  },
  {
    key: "notingOrder" as const,
    label: "Noting Order",
    shortLabel: "Noting Order",
    icon: FileCheck,
    description: "EME BN collates data and forwards Noting to Div HQ",
    actor: "EME Battalion",
    stageThreshold: "eme-battalion" as WorkflowStage,
  },
  {
    key: "roByDivHQ" as const,
    label: "RO by Div HQ",
    shortLabel: "Release Order by Div HQ",
    icon: Landmark,
    description: "Division HQ reviews and issues Release Order",
    actor: "Div HQ",
    stageThreshold: "div-hq" as WorkflowStage,
  },
  {
    key: "soByEngrRgt" as const,
    label: "SO by Engr Rgt",
    shortLabel: "Supply Order by Engr Rgt",
    icon: Shield,
    description: "Engineer Regiment issues Supply Order",
    actor: "Engr Regiment",
    stageThreshold: "engineer-regiment" as WorkflowStage,
  },
  {
    key: "handoverToVendor" as const,
    label: "Handover to Vendor",
    shortLabel: "Handover to Vendor",
    icon: PackageCheck,
    description: "Equipment physically handed over to the vendor for repair",
    actor: "Unit",
    stageThreshold: "engineer-regiment" as WorkflowStage,
  },
  {
    key: "vendorPDC" as const,
    label: "Vendor",
    shortLabel: "Vendor",
    icon: Truck,
    description: "Vendor's Probable Date of Completion for the repair",
    actor: "Vendor",
    stageThreshold: "po" as WorkflowStage,
  },
  {
    key: "repairDone" as const,
    label: "Repair Done",
    shortLabel: "Repair Done",
    icon: CircleCheckBig,
    description: "Repair completed and equipment ready for handback",
    actor: "Vendor",
    stageThreshold: "repair-complete" as WorkflowStage,
  },
] as const;

type FlowStageKey = (typeof FLOW_STAGES)[number]["key"];

const STAGE_ORDER: WorkflowStage[] = [
  "unit",
  "workshop",
  "eme-battalion",
  "div-hq",
  "engineer-regiment",
  "po",
  "repair-complete",
];

function getStageIndex(stage: WorkflowStage): number {
  return STAGE_ORDER.indexOf(stage);
}

function getFlowStageStatus(
  stageIndex: number,
  currentStageIndex: number,
  record: CurrentRepairState,
  stageKey: FlowStageKey,
): "completed" | "current" | "pending" {
  const dateValue = record[stageKey];
  if (dateValue) {
    if (
      stageIndex < currentStageIndex ||
      computeCurrentStage(record) === "repair-complete"
    ) {
      return "completed";
    }
    if (stageIndex === currentStageIndex) {
      return "current";
    }
  }
  if (stageIndex === currentStageIndex) {
    return "current";
  }
  return "pending";
}

const CurrentRepairStateComponent: React.FC<CurrentRepairStateProps> = ({
  assetType,
  selectedHierarchy,
  onBack,
}) => {
  const { user } = useAuth();
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
        return true;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getElapsedBadge = (days: number) => {
    if (days <= 7) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">{days}d</Badge>
      );
    }
    if (days <= 14) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">{days}d</Badge>;
    }
    return <Badge variant="destructive">{days}d</Badge>;
  };

  const getStageBadge = (stage: WorkflowStage) => {
    const stageLabels: Record<
      WorkflowStage,
      { label: string; className: string }
    > = {
      unit: {
        label: "Unit",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      workshop: {
        label: "Workshop",
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
      "eme-battalion": {
        label: "EME BN",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "div-hq": {
        label: "Div HQ",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      "engineer-regiment": {
        label: "Engr Rgt",
        className: "bg-teal-100 text-teal-800 border-teal-200",
      },
      po: {
        label: "Vendor",
        className: "bg-violet-100 text-violet-800 border-violet-200",
      },
      "repair-complete": {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
    };
    const config = stageLabels[stage];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Assets
      </Button>

      <CRSStatsChart crsData={filteredData} />

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-12">S.No</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="min-w-[180px]">Defect</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead>WO Date</TableHead>
                  <TableHead>Elapsed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record, index) => {
                  const isExpanded = expandedRow === record.id;
                  const stage = computeCurrentStage(record);
                  const stageIdx = getStageIndex(stage);
                  const totalStages = STAGE_ORDER.length;
                  return (
                    <React.Fragment key={record.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleRow(record.id)}
                      >
                        <TableCell className="px-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {getOrgName(record.organizationId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            {record.equipment.name}
                            <span onClick={(e) => e.stopPropagation()}>
                              <EquipmentInfoDialog
                                equipment={record.equipment}
                              />
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="max-w-[220px] truncate text-xs text-muted-foreground"
                          title={record.defect}
                        >
                          {record.defect}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {getStageBadge(stage)}
                            {record.vendorName && (
                              <span
                                className="text-[10px] text-violet-600 font-medium truncate max-w-[120px]"
                                title={record.vendorName}
                              >
                                {record.vendorName}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <MiniProgress
                            currentIndex={stageIdx}
                            total={totalStages}
                            isComplete={stage === "repair-complete"}
                          />
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                          {formatDate(record.woFwdByUnit)}
                        </TableCell>
                        <TableCell>
                          {getElapsedBadge(getElapsedDays(record))}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <TableCell colSpan={9} className="p-0">
                            <WorkflowFlowVisualization record={record} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

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

/* ──────── Mini Progress Indicator ──────── */
const MiniProgress: React.FC<{
  currentIndex: number;
  total: number;
  isComplete: boolean;
}> = ({ currentIndex, total, isComplete }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => {
        const filled = isComplete ? true : i < currentIndex;
        const isCurrent = !isComplete && i === currentIndex;
        return (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full min-w-[10px] max-w-[14px] transition-colors ${
              filled
                ? "bg-emerald-500"
                : isCurrent
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-200"
            }`}
          />
        );
      })}
      <span className="ml-1.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
        {isComplete ? total : currentIndex}/{total}
      </span>
    </div>
  );
};

/* ──────── Workflow Flow Visualization ──────── */
const WorkflowFlowVisualization: React.FC<{ record: CurrentRepairState }> = ({
  record,
}) => {
  const stage = computeCurrentStage(record);
  const currentStageIndex = getStageIndex(stage);
  const isRepairComplete = stage === "repair-complete";
  const elapsed = getElapsedDays(record);

  const formatDateFull = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-5 space-y-4">
      {/* ── Top: Info Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        {/* Left: Equipment & Defect details */}
        <div className="space-y-3">
          {/* Row 1: Equipment identity */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Wrench className="h-4 w-4 text-slate-500" />
              {record.equipment.name}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {record.equipment.make} {record.equipment.model}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">
              S/N: {record.equipment.serialNumber}
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-[10px]">
              {getOrgName(record.organizationId)}
            </Badge>
          </div>

          {/* Row 2: Defect */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Defect
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {record.defect}
            </p>
          </div>

          {/* Row 3: Key dates & vendor */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-500">
              WO Raised:{" "}
              <span className="font-medium text-slate-700">
                {formatDateFull(record.woFwdByUnit)}
              </span>
            </span>
            {record.vendorName && (
              <span className="text-slate-500">
                Vendor:{" "}
                <span className="font-medium text-violet-700">
                  {record.vendorName}
                </span>
              </span>
            )}
            {record.vendorPDC && (
              <span className="text-slate-500">
                PDC:{" "}
                <span className="font-medium text-slate-700">
                  {formatDateFull(record.vendorPDC)}
                </span>
              </span>
            )}
            {record.repairDone && (
              <span className="text-slate-500">
                Completed:{" "}
                <span className="font-medium text-emerald-700">
                  {formatDateFull(record.repairDone)}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Status card */}
        <div className="flex flex-col items-center justify-center gap-1.5 min-w-[120px]">
          {isRepairComplete ? (
            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">
                Repair Complete
              </span>
              <span className="text-[10px] text-emerald-600">
                {elapsed} days total
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="h-6 w-6 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">
                In Progress
              </span>
              <span
                className={`text-[10px] font-semibold ${elapsed > 14 ? "text-red-600" : "text-amber-600"}`}
              >
                {elapsed} days elapsed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-slate-200" />

      {/* ── Flow Pipeline ── */}
      <div className="flex items-start justify-between gap-0 pb-1">
        {FLOW_STAGES.map((stg, idx) => {
          const stageThresholdIndex = getStageIndex(stg.stageThreshold);
          const status = getFlowStageStatus(
            stageThresholdIndex,
            currentStageIndex,
            record,
            stg.key,
          );
          const dateValue = record[stg.key];
          const IconComponent = stg.icon;
          const isLast = idx === FLOW_STAGES.length - 1;

          // Use vendor name for vendor-related stages
          const actorLabel =
            (stg.key === "vendorPDC" ||
              stg.key === "handoverToVendor" ||
              stg.key === "repairDone") &&
            record.vendorName
              ? record.vendorName
              : stg.actor;

          return (
            <React.Fragment key={stg.key}>
              <div className="flex flex-col items-center flex-1 min-w-0 relative group">
                {/* Node */}
                <div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${
                      status === "completed"
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                        : status === "current"
                          ? "bg-amber-100 border-amber-500 text-amber-700 shadow-md shadow-amber-200 ring-4 ring-amber-50"
                          : "bg-slate-50 border-slate-300 text-slate-400"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : status === "current" ? (
                    <IconComponent className="h-5 w-5 animate-pulse" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-2 text-[11px] font-semibold text-center leading-tight max-w-[90px] ${
                    status === "completed"
                      ? "text-emerald-700"
                      : status === "current"
                        ? "text-amber-700"
                        : "text-slate-500"
                  }`}
                >
                  {stg.shortLabel}
                </span>

                {/* Date */}
                <span
                  className={`mt-0.5 text-[10px] ${
                    status === "completed"
                      ? "text-emerald-600"
                      : status === "current"
                        ? "text-amber-600"
                        : "text-slate-400"
                  }`}
                >
                  {dateValue ? formatDateFull(dateValue) : "—"}
                </span>

                {/* Actor pill */}
                <span className="mt-1 text-[10px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full text-center leading-tight truncate max-w-[100px]">
                  {actorLabel}
                </span>

                {/* Tooltip */}
                <div className="absolute top-full mt-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                    {stg.description}
                  </div>
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex items-center pt-5 -mx-0.5 shrink-0">
                  <div
                    className={`h-0.5 w-6 ${
                      status === "completed" ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] ${
                      status === "completed"
                        ? "border-l-emerald-400"
                        : "border-l-slate-200"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-5 text-[10px] text-muted-foreground pt-1">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentRepairStateComponent;
