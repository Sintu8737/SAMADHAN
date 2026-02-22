export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Hierarchy {
  corps: string;
  division: string;
  brigade: string;
  battalion: string;
}

export interface Equipment {
  id: string;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
}

export interface PreventiveMaintenance {
  id: string;
  equipment: Equipment;
  qtr1: { status: 'completed' | 'pending' | 'overdue'; date?: string };
  qtr2: { status: 'completed' | 'pending' | 'overdue'; date?: string };
  qtr3: { status: 'completed' | 'pending' | 'overdue'; date?: string };
  qtr4: { status: 'completed' | 'pending' | 'overdue'; date?: string };
  comments?: string;
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
  equipment: Equipment;
  repairs: Repair[];
  totalBreakdowns: number;
  totalCost: number;
}

export interface CurrentRepairState {
  id: string;
  equipment: Equipment;
  defect: string;
  woFwdToEMEBN: string;
  notifyToDivHQ: string;
  roReleasedByDivHQ: string;
  soPlannedByEngrRgt: string;
  vendorPDC: string;
  totalDaysElapsed: number;
}

export type AssetType = 'generator' | 'wss-pumps';
export type MaintenanceType = 'preventive' | 'reactive' | 'current-repair';
