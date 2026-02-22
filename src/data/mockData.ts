import { Hierarchy, Equipment, PreventiveMaintenance, ReactiveMaintenance, CurrentRepairState } from '../types';

export const mockHierarchies: Hierarchy[] = [
  { corps: '1 Corps', division: '1 Infantry Division', brigade: '1 Infantry Brigade', battalion: '1st Battalion' },
  { corps: '1 Corps', division: '1 Infantry Division', brigade: '1 Infantry Brigade', battalion: '2nd Battalion' },
  { corps: '1 Corps', division: '2 Infantry Division', brigade: '3 Infantry Brigade', battalion: '5th Battalion' },
  { corps: '2 Corps', division: '4 Infantry Division', brigade: '7 Infantry Brigade', battalion: '10th Battalion' },
];

export const mockEquipment: Equipment[] = [
  { id: '1', name: 'Generator Set 5KVA', make: 'Kirloskar', model: 'KOEL-5KVA', serialNumber: 'GEN001' },
  { id: '2', name: 'Generator Set 10KVA', make: 'Cummins', model: 'C10D5', serialNumber: 'GEN002' },
  { id: '3', name: 'WSS Pump 100HP', make: 'KSB', model: 'KP-100', serialNumber: 'WSS001' },
  { id: '4', name: 'WSS Pump 50HP', make: 'CRI', model: 'CRI-50', serialNumber: 'WSS002' },
  { id: '5', name: 'Generator Set 15KVA', make: 'Ashok Leyland', model: 'AL-15KVA', serialNumber: 'GEN003' },
];

export const mockPreventiveMaintenance: PreventiveMaintenance[] = [
  {
    id: '1',
    equipment: mockEquipment[0],
    qtr1: { status: 'completed', date: '2024-01-15' },
    qtr2: { status: 'completed', date: '2024-04-20' },
    qtr3: { status: 'pending' },
    qtr4: { status: 'pending' },
    comments: 'Regular maintenance completed on schedule'
  },
  {
    id: '2',
    equipment: mockEquipment[1],
    qtr1: { status: 'completed', date: '2024-01-20' },
    qtr2: { status: 'overdue' },
    qtr3: { status: 'pending' },
    qtr4: { status: 'pending' },
    comments: 'Q2 maintenance delayed due to parts shortage'
  },
];

export const mockReactiveMaintenance: ReactiveMaintenance[] = [
  {
    id: '1',
    equipment: mockEquipment[0],
    repairs: [
      { id: '1', date: '2024-02-10', description: 'Fuel pump replacement', cost: 5000, downtime: 2 },
      { id: '2', date: '2024-05-15', description: 'Alternator repair', cost: 8000, downtime: 3 },
      { id: '3', date: '2024-08-20', description: 'Engine oil leak fix', cost: 3000, downtime: 1 },
    ],
    totalBreakdowns: 3,
    totalCost: 16000
  },
  {
    id: '2',
    equipment: mockEquipment[1],
    repairs: [
      { id: '1', date: '2024-03-12', description: 'Battery replacement', cost: 2500, downtime: 1 },
      { id: '2', date: '2024-06-25', description: 'Starter motor repair', cost: 6000, downtime: 2 },
      { id: '3', date: '2024-09-10', description: 'Cooling system repair', cost: 4500, downtime: 2 },
    ],
    totalBreakdowns: 3,
    totalCost: 13000
  },
];

export const mockCurrentRepairState: CurrentRepairState[] = [
  {
    id: '1',
    equipment: mockEquipment[0],
    defect: 'Engine overheating issue',
    woFwdToEMEBN: '2024-10-01',
    notifyToDivHQ: '2024-10-02',
    roReleasedByDivHQ: '2024-10-05',
    soPlannedByEngrRgt: '2024-10-08',
    vendorPDC: '2024-10-15',
    totalDaysElapsed: 14
  },
  {
    id: '2',
    equipment: mockEquipment[1],
    defect: 'Voltage fluctuation problem',
    woFwdToEMEBN: '2024-10-03',
    notifyToDivHQ: '2024-10-04',
    roReleasedByDivHQ: '2024-10-07',
    soPlannedByEngrRgt: '2024-10-10',
    vendorPDC: '2024-10-18',
    totalDaysElapsed: 15
  },
];
