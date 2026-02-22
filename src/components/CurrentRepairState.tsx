import React, { useState } from 'react';
import { AssetType } from '../types';
import { mockEquipment, mockCurrentRepairState } from '../data/mockData';

interface CurrentRepairStateProps {
  assetType: AssetType;
  onBack: () => void;
}

const CurrentRepairStateComponent: React.FC<CurrentRepairStateProps> = ({ assetType, onBack }) => {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  
  const filteredEquipment = mockEquipment.filter(eq => 
    assetType === 'generator' ? eq.name.includes('Generator') : eq.name.includes('WSS')
  );
  
  const repairData = mockCurrentRepairState.filter(crs => 
    filteredEquipment.some(eq => eq.id === crs.equipment.id)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysElapsedColor = (days: number) => {
    if (days <= 7) return 'text-green-600 font-semibold';
    if (days <= 14) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="military-header flex justify-between items-center">
        <h1>
          {assetType === 'generator' ? 'Genr' : 'WSS Pumps'}: Current Repair State
        </h1>
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <div className="container mx-auto p-6">
        {/* Equipment Selection */}
        <div className="military-card p-6 mb-6">
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Current Repair State Table */}
        <div className="military-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-army-dark text-white">
                  <th className="border-2 border-army-olive px-3 py-2 text-left">S.No</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-left">Eqpt Name</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-left">Make</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-left">Model</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-left">Defect</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">WO Fwd to EME BN</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">Notify to DIV HQ</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">RO Released by Div HQ</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">SO Planned by Engr Rgt</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">Vendor PDC</th>
                  <th className="border-2 border-army-olive px-3 py-2 text-center">Total No of Days Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {repairData
                  .filter(crs => !selectedEquipment || crs.equipment.id === selectedEquipment)
                  .map((crs, index) => (
                    <tr key={crs.id} className="hover:bg-gray-50">
                      <td className="border-2 border-army-olive px-3 py-2">{index + 1}</td>
                      <td className="border-2 border-army-olive px-3 py-2 font-medium">{crs.equipment.name}</td>
                      <td className="border-2 border-army-olive px-3 py-2">{crs.equipment.make}</td>
                      <td className="border-2 border-army-olive px-3 py-2">{crs.equipment.model}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-red-600 font-medium">{crs.defect}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-center">{formatDate(crs.woFwdToEMEBN)}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-center">{formatDate(crs.notifyToDivHQ)}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-center">{formatDate(crs.roReleasedByDivHQ)}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-center">{formatDate(crs.soPlannedByEngrRgt)}</td>
                      <td className="border-2 border-army-olive px-3 py-2 text-center">{formatDate(crs.vendorPDC)}</td>
                      <td className={`border-2 border-army-olive px-3 py-2 text-center ${getDaysElapsedColor(crs.totalDaysElapsed)}`}>
                        {crs.totalDaysElapsed}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {repairData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No current repair data available for the selected equipment.
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><span className="text-green-600 font-semibold">●</span> ≤ 7 days (On Track)</p>
            <p><span className="text-yellow-600 font-semibold">●</span> 8-14 days (Attention Required)</p>
            <p><span className="text-red-600 font-semibold">●</span> &gt; 14 days (Critical)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentRepairStateComponent;
