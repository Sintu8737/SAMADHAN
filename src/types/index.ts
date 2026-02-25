export type UserRole =
  | "admin"
  | "unit"
  | "workshop"
  | "eme-battalion"
  | "div-hq"
  | "engineer-regiment";

export type OrganizationLevel = "corps" | "division" | "brigade" | "unit";

export type AssetType = "generator" | "wss-pumps";

export type MaintenanceType = "preventive" | "reactive" | "current-repair";

export type WorkflowStage =
  | "unit"
  | "workshop"
  | "eme-battalion"
  | "div-hq"
  | "engineer-regiment"
  | "po"
  | "repair-complete";

export type MaintenanceStatus = "completed" | "pending" | "overdue";

export interface PreventiveQuarter {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  status: MaintenanceStatus;
  date?: string;
  comment?: string;
}

export interface OrganizationNode {
  id: string;
  name: string;
  level: OrganizationLevel;
  parentId?: string;
}

export interface HierarchySelection {
  corpsId: string;
  divisionId?: string;
  brigadeId?: string;
  unitId?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  organizationId?: string;
}

export interface Equipment {
  id: string;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
  assetType: AssetType;
  organizationId: string;
  cost: number;
}

export interface PreventiveMaintenance {
  id: string;
  organizationId: string;
  equipment: Equipment;
  quarters: PreventiveQuarter[];
}

export interface Repair {
  id: string;
  date: string;
  description: string;
  cost: number;
  downtime: number;
}

export interface ReactiveMaintenance {
  id: string;
  organizationId: string;
  equipment: Equipment;
  repairs: Repair[];
  totalBreakdowns: number;
  totalCost: number;
  totalDowntime: number;
}

export interface WorkflowHistoryEntry {
  stage: WorkflowStage;
  role: UserRole;
  status: "pending" | "in-progress" | "approved" | "completed";
  actionDate?: string;
  remarks?: string;
}

export interface ReactiveRepairWorkflow {
  id: string;
  organizationId: string;
  equipment: Equipment;
  defect: string;
  createdByRole: UserRole;
  currentStage: WorkflowStage;
  stageDates: {
    unitRaised: string;
    workshopReceived?: string;
    emeEscalated?: string;
    divRoApproved?: string;
    engrSoIssued?: string;
    poRaised?: string;
    repairCompleted?: string;
  };
  totalCost: number;
  totalDowntime: number;
  history: WorkflowHistoryEntry[];
}

export interface CurrentRepairState {
  id: string;
  organizationId: string;
  equipment: Equipment;
  defect: string;
  woFwdByUnit: string;
  woToEMEBN?: string;
  notingOrder?: string;
  roByDivHQ?: string;
  soByEngrRgt?: string;
  handoverToVendor?: string;
  vendorName?: string;
  vendorPDC?: string;
  repairDone?: string;
}
