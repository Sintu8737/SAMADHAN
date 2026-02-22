import React, { useState } from 'react';
import { AssetType } from '../types';
import { mockEquipment, mockReactiveMaintenance } from '../data/mockData';

interface ReactiveMaintenanceProps {
  assetType: AssetType;
  onBack: () => void;
}

const ReactiveMaintenanceComponent: React.FC<ReactiveMaintenanceProps> = ({ assetType, onBack }) => {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [last3Repairs, setLast3Repairs] = useState('all');
  
  const filteredEquipment = mockEquipment.filter(eq => 
    assetType === 'generator' ? eq.name.includes('Generator') : eq.name.includes('WSS')
  );
  
  const maintenanceData = mockReactiveMaintenance.filter(rm => 
    filteredEquipment.some(eq => eq.id === rm.equipment.id)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRepairDisplay = (repairs: any[], repairIndex: number) => {
    if (repairIndex >= repairs.length) return '-';
    const repair = repairs[repairIndex];
    return (
      <div className="text-xs">
        <div className="font-semibold">{formatDate(repair.date)}</div>
        <div>{repair.description}</div>
        <div className="text-blue-600">₹{repair.cost.toLocaleString()}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="military-header flex justify-between items-center">
        <h1>
          {assetType === 'generator' ? 'Genr' : 'WSS Pumps'}: Reactive Maint
        </h1>
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <div className="container mx-auto p-6">
        {/* Controls */}
        <div className="military-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 flex-1">
              <label className="text-sm font-medium text-gray-700">Select Eqpt:</label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="military-input flex-1 max-w-md"
              >
                <option value="">All Equipment</option>
                {filteredEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} - {eq.make} {eq.model}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Last 3 Repairs:</label>
              <select
                value={last3Repairs}
                onChange={(e) => setLast3Repairs(e.target.value)}
                className="military-input"
              >
                <option value="all">All Time</option>
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="military-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-army-dark text-white">
                  <th className="border-2 border-army-olive px-4 py-2 text-left">S.No</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-left">Eqpt Name</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-left">Make</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-left">Model</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-center">Repair 1</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-center">Repair 2</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-center">Repair 3</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-center">Total Breakdowns in Service</th>
                  <th className="border-2 border-army-olive px-4 py-2 text-center">Cost of Breakdown + Repair</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData
                  .filter(rm => !selectedEquipment || rm.equipment.id === selectedEquipment)
                  .map((rm, index) => (
                    <tr key={rm.id} className="hover:bg-gray-50">
                      <td className="border-2 border-army-olive px-4 py-2">{index + 1}</td>
                      <td className="border-2 border-army-olive px-4 py-2">{rm.equipment.name}</td>
                      <td className="border-2 border-army-olive px-4 py-2">{rm.equipment.make}</td>
                      <td className="border-2 border-army-olive px-4 py-2">{rm.equipment.model}</td>
                      <td className="border-2 border-army-olive px-4 py-2">
                        {getRepairDisplay(rm.repairs, 0)}
                      </td>
                      <td className="border-2 border-army-olive px-4 py-2">
                        {getRepairDisplay(rm.repairs, 1)}
                      </td>
                      <td className="border-2 border-army-olive px-4 py-2">
                        {getRepairDisplay(rm.repairs, 2)}
                      </td>
                      <td className="border-2 border-army-olive px-4 py-2 text-center font-semibold">
                        {rm.totalBreakdowns}
                      </td>
                      <td className="border-2 border-army-olive px-4 py-2 text-center font-semibold text-blue-600">
                        ₹{rm.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {maintenanceData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reactive maintenance data available for the selected equipment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactiveMaintenanceComponent;
