import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple authentication logic (in real app, this would be API call)
    if (username === 'army' && password === 'army123') {
      const user: User = {
        id: '1',
        username: username,
        role: 'admin'
      };
      onLogin(user);
    } else {
      setError('Invalid credentials. Use army/army123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #2F4F2F, #556B2F)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="military-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2F4F2F', marginBottom: '0.5rem' }}>Indian Army</h1>
          <h2 style={{ fontSize: '1.25rem', color: '#666' }}>Asset Management System</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="military-input"
              style={{ width: '100%' }}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="military-input"
              style={{ width: '100%' }}
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.25rem'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="military-button"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem' }}
          >
            Login
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
          Demo Credentials: army / army123
        </div>
      </div>
    </div>
  );
};

export default Login;
