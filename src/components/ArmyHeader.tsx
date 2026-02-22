import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ArmyHeaderProps {
  title: string;
  onLogout?: () => void;
  showLogout?: boolean;
}

const ArmyHeader: React.FC<ArmyHeaderProps> = ({ title, onLogout, showLogout = false }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d4a2b 50%, #1a1a1a 100%)',
      color: '#ffffff',
      padding: '0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top border */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 25%, #138808 50%, #FFFFFF 75%, #FF9933 100%)',
        width: '100%'
      }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        position: 'relative'
      }}>
        {/* Left section with Ashoka Chakra and title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Ashoka Chakra SVG */}
          <svg width="60" height="60" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            <circle cx="50" cy="50" r="45" fill="#138808" stroke="#FF9933" strokeWidth="2"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
            {/* 24 spokes */}
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const x1 = 50 + 35 * Math.cos(angle);
              const y1 = 50 + 35 * Math.sin(angle);
              const x2 = 50 + 15 * Math.cos(angle);
              const y2 = 50 + 15 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              );
            })}
            <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
          </svg>
          
          {/* Title section */}
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              Indian Army
            </h1>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '500',
              color: '#e0e0e0',
              marginTop: '0.25rem'
            }}>
              {title}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Military emblem */}
          <svg width="40" height="40" viewBox="0 0 100 100">
            <polygon points="50,10 60,35 85,35 65,50 75,75 50,60 25,75 35,50 15,35 40,35" 
                     fill="#FF9933" stroke="#FFFFFF" strokeWidth="1"/>
          </svg>
          
          {/* Logout button */}
          {showLogout && isAuthenticated && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Decorative bottom pattern */}
      <div style={{
        height: '2px',
        background: 'repeating-linear-gradient(90deg, #FF9933 0px, #FF9933 10px, #138808 10px, #138808 20px)',
        opacity: 0.7
      }} />
    </header>
  );
};

export default ArmyHeader;
