import React, { useState } from 'react';
import { AssetType, MaintenanceType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProtectedAction from './ProtectedAction';

interface LandingPageProps {
  onAssetSelect: (asset: AssetType, maintenance: MaintenanceType) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAssetSelect }) => {
  const [corps, setCorps] = useState('');
  const [division, setDivision] = useState('');
  const [brigade, setBrigade] = useState('');
  const [battalion, setBattalion] = useState('');

  const corpsOptions = ['1 Corps', '2 Corps', '3 Corps'];
  const divisionOptions = ['1 Infantry Division', '2 Infantry Division', '4 Infantry Division'];
  const brigadeOptions = ['1 Infantry Brigade', '3 Infantry Brigade', '7 Infantry Brigade'];
  const battalionOptions = ['1st Battalion', '2nd Battalion', '5th Battalion', '10th Battalion'];

  const handleAssetClick = (asset: AssetType, maintenance: MaintenanceType) => {
    if (!corps || !division || !brigade || !battalion) {
      alert('Please select all hierarchy levels before proceeding.');
      return;
    }
    onAssetSelect(asset, maintenance);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div className="container" style={{ padding: '1.5rem' }}>
        {/* Hierarchy Selection */}
        <div className="military-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: 'var(--army-dark)', 
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Unit Hierarchy Selection
            </h2>
            <div style={{ 
              width: '100px', 
              height: '3px', 
              background: 'linear-gradient(90deg, var(--indian-saffron), var(--indian-green))',
              margin: '0 auto'
            }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Corps
              </label>
              <select
                value={corps}
                onChange={(e) => setCorps(e.target.value)}
                className="military-input w-full"
              >
                <option value="">Select Corps</option>
                {corpsOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="military-input w-full"
              >
                <option value="">Select Division</option>
                {divisionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Brigade (Bde)
              </label>
              <select
                value={brigade}
                onChange={(e) => setBrigade(e.target.value)}
                className="military-input w-full"
              >
                <option value="">Select Brigade</option>
                {brigadeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Battalion
              </label>
              <select
                value={battalion}
                onChange={(e) => setBattalion(e.target.value)}
                className="military-input w-full"
              >
                <option value="">Select Battalion</option>
                {battalionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="military-card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: 'var(--army-dark)', 
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Asset Management
            </h2>
            <div style={{ 
              width: '100px', 
              height: '3px', 
              background: 'linear-gradient(90deg, var(--indian-saffron), var(--indian-green))',
              margin: '0 auto'
            }} />
          </div>
          
          <div className="grid lg:grid-cols-2" style={{ gap: '2rem' }}>
            {/* Generators Section */}
            <div style={{ 
              border: '2px solid var(--army-olive)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--army-olive)',
                color: 'white',
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Power Systems
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                {/* Generator SVG Icon */}
                <svg width="60" height="60" viewBox="0 0 100 100" style={{ margin: '0 auto 1rem' }}>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="var(--army-olive)" strokeWidth="3"/>
                  <path d="M 30 50 L 70 50 M 50 30 L 50 70" stroke="var(--army-dark)" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="8" fill="var(--army-olive)"/>
                  <path d="M 20 35 Q 50 20 80 35" fill="none" stroke="var(--indian-saffron)" strokeWidth="2"/>
                  <path d="M 20 65 Q 50 80 80 65" fill="none" stroke="var(--indian-green)" strokeWidth="2"/>
                </svg>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: 'var(--army-dark)', 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  GENR (Generators)
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '1rem'
                }}>
                  Power generation equipment maintenance
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('generator', 'preventive')}
                    className="military-button w-full"
                  >
                    Preventive Maint
                  </button>
                </ProtectedAction>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('generator', 'reactive')}
                    className="military-button w-full"
                  >
                    Reactive Maint
                  </button>
                </ProtectedAction>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('generator', 'current-repair')}
                    className="military-button w-full"
                  >
                    Current Repair Statn
                  </button>
                </ProtectedAction>
              </div>
            </div>
            
            {/* WSS Pumps Section */}
            <div style={{ 
              border: '2px solid var(--army-olive)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--army-olive)',
                color: 'white',
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Water Systems
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                {/* Water Pump SVG Icon */}
                <svg width="60" height="60" viewBox="0 0 100 100" style={{ margin: '0 auto 1rem' }}>
                  <rect x="35" y="20" width="30" height="40" fill="var(--army-olive)" rx="5"/>
                  <circle cx="50" cy="40" r="8" fill="white"/>
                  <path d="M 30 60 L 70 60 L 65 80 L 35 80 Z" fill="var(--army-dark)"/>
                  <path d="M 20 40 Q 30 35 40 40" fill="none" stroke="var(--indian-saffron)" strokeWidth="2"/>
                  <path d="M 60 40 Q 70 35 80 40" fill="none" stroke="var(--indian-saffron)" strokeWidth="2"/>
                  <circle cx="25" cy="40" r="3" fill="var(--indian-saffron)"/>
                  <circle cx="75" cy="40" r="3" fill="var(--indian-saffron)"/>
                </svg>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: 'var(--army-dark)', 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  WSS PUMPS
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '1rem'
                }}>
                  Water supply system maintenance
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('wss-pumps', 'preventive')}
                    className="military-button w-full"
                  >
                    Preventive Maint
                  </button>
                </ProtectedAction>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('wss-pumps', 'reactive')}
                    className="military-button w-full"
                  >
                    Reactive Maint
                  </button>
                </ProtectedAction>
                <ProtectedAction>
                  <button
                    onClick={() => handleAssetClick('wss-pumps', 'current-repair')}
                    className="military-button w-full"
                  >
                    Current Repair Statn
                  </button>
                </ProtectedAction>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
