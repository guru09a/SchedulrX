import React from 'react';
import { Cpu } from 'lucide-react';
import './Header.css';

const Header = ({ algorithm, setAlgorithm, quantum, setQuantum }) => {
  const algorithms = [
    'FCFS',
    'SJF',
    'SRTF',
    'RR',
    'Priority',
    'Priority (Preemptive)'
  ];

  return (
    <header className="header glass-panel">
      <div className="header-logo">
        <Cpu className="logo-icon" size={32} />
        <h1>OS Scheduler<span className="accent">Sim</span></h1>
      </div>
      
      <div className="header-controls">
        <div className="control-group">
          <label>Algorithm</label>
          <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value)}
            className="styled-select"
          >
            {algorithms.map(alg => (
              <option key={alg} value={alg}>{alg}</option>
            ))}
          </select>
        </div>
        
        {algorithm === 'RR' && (
          <div className="control-group">
            <label>Quantum Time</label>
            <input 
              type="number" 
              min="1" 
              value={quantum} 
              onChange={(e) => setQuantum(parseInt(e.target.value) || 1)}
              className="styled-input"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
