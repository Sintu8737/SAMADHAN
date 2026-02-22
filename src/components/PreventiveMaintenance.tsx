import React, { useState } from 'react';
import { AssetType } from '../types';
import { mockEquipment, mockPreventiveMaintenance } from '../data/mockData';
import ProtectedAction from './ProtectedAction';

interface PreventiveMaintenanceProps {
  assetType: AssetType;
  onBack: () => void;
}

const PreventiveMaintenanceComponent: React.FC<PreventiveMaintenanceProps> = ({ assetType, onBack }) => {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  
  const filteredEquipment = mockEquipment.filter(eq => 
    assetType === 'generator' ? eq.name.includes('Generator') : eq.name.includes('WSS')
  );
  
  const maintenanceData = mockPreventiveMaintenance.filter(pm => 
    filteredEquipment.some(eq => eq.id === pm.equipment.id)
  );

  const getStatusText = (status: string, date?: string) => {
    if (status === 'completed' && date) return `✓ ${date}`;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div className="container" style={{ padding: '1.5rem' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2937';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Assets
          </button>
        </div>
        {/* Equipment Selection */}
        <div className="military-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="flex items-center space-x-4">
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Select Eqpt:</label>
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

        {/* Maintenance Table */}
        <div className="military-card" style={{ padding: '1.5rem' }}>
          <div className="overflow-x-auto">
            <table className="table" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-army-dark text-white">
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'left' }}>S.No</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'left' }}>Eqpt Name</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'left' }}>Make</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'left' }}>Model</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>Qtr 1</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>Qtr 2</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>Qtr 3</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>Qtr 4</th>
                  <th style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'left' }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData
                  .filter(pm => !selectedEquipment || pm.equipment.id === selectedEquipment)
                  .map((pm, index) => (
                    <tr key={pm.id} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem' }}>{index + 1}</td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem' }}>{pm.equipment.name}</td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem' }}>{pm.equipment.make}</td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem' }}>{pm.equipment.model}</td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <span className={`status-${pm.qtr1.status}`}>
                          {getStatusText(pm.qtr1.status, pm.qtr1.date)}
                        </span>
                      </td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <span className={`status-${pm.qtr2.status}`}>
                          {getStatusText(pm.qtr2.status, pm.qtr2.date)}
                        </span>
                      </td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <span className={`status-${pm.qtr3.status}`}>
                          {getStatusText(pm.qtr3.status, pm.qtr3.date)}
                        </span>
                      </td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <span className={`status-${pm.qtr4.status}`}>
                          {getStatusText(pm.qtr4.status, pm.qtr4.date)}
                        </span>
                      </td>
                      <td style={{ border: '2px solid var(--army-olive)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        {pm.comments || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {maintenanceData.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No maintenance data available for the selected equipment.
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
            <p><span style={{ display: 'inline-block', width: '1rem', height: '1rem', backgroundColor: '#10b981', marginRight: '0.5rem' }}></span>Completed</p>
            <p><span style={{ display: 'inline-block', width: '1rem', height: '1rem', backgroundColor: '#f59e0b', marginRight: '0.5rem' }}></span>Pending</p>
            <p><span style={{ display: 'inline-block', width: '1rem', height: '1rem', backgroundColor: '#ef4444', marginRight: '0.5rem' }}></span>Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveMaintenanceComponent;