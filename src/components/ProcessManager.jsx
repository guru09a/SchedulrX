import React, { useState } from 'react';
import { Plus, Trash2, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProcessManager.css';

const ProcessManager = ({ processes, setProcesses, runSimulation, resetSimulation }) => {
  const [newProcess, setNewProcess] = useState({ id: '', arrivalTime: 0, burstTime: 1, priority: 1 });
  const [nextId, setNextId] = useState(1);

  const handleAddProcess = (e) => {
    e.preventDefault();
    if (newProcess.burstTime <= 0) return;
    
    const processToAdd = {
      ...newProcess,
      id: `P${nextId}`,
      arrivalTime: Number(newProcess.arrivalTime),
      burstTime: Number(newProcess.burstTime),
      priority: Number(newProcess.priority)
    };

    setProcesses([...processes, processToAdd]);
    setNextId(nextId + 1);
    // Reset inputs, keep current arrival as baseline or just 0
    setNewProcess({ id: '', arrivalTime: processToAdd.arrivalTime, burstTime: 1, priority: 1 });
  };

  const removeProcess = (id) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <div className="process-manager glass-panel">
      <div className="panel-header">
        <h2>Process Queue</h2>
        <div className="panel-actions">
          <button className="btn btn-secondary" onClick={resetSimulation}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="btn btn-primary" onClick={runSimulation} disabled={processes.length === 0}>
            <Play size={16} fill="currentColor" /> Simulate
          </button>
        </div>
      </div>

      <form className="add-process-form" onSubmit={handleAddProcess}>
        <div className="input-group">
          <label>Arrival Time</label>
          <input 
            type="number" 
            min="0" 
            value={newProcess.arrivalTime} 
            onChange={e => setNewProcess({...newProcess, arrivalTime: e.target.value})}
            required
          />
        </div>
        <div className="input-group">
          <label>Burst Time</label>
          <input 
            type="number" 
            min="1" 
            value={newProcess.burstTime} 
            onChange={e => setNewProcess({...newProcess, burstTime: e.target.value})}
            required
          />
        </div>
        <div className="input-group">
          <label>Priority</label>
          <input 
            type="number" 
            min="0" 
            value={newProcess.priority} 
            onChange={e => setNewProcess({...newProcess, priority: e.target.value})}
          />
        </div>
        <button type="submit" className="btn btn-icon btn-add">
          <Plus size={20} />
        </button>
      </form>

      <div className="table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {processes.map(p => (
                <motion.tr 
                  key={p.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="process-id-cell">
                     <span className="process-badge">{p.id}</span>
                  </td>
                  <td>{p.arrivalTime}</td>
                  <td>{p.burstTime}</td>
                  <td>{p.priority}</td>
                  <td>
                    <button className="btn-icon btn-delete" onClick={() => removeProcess(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {processes.length === 0 && (
          <div className="empty-state">
            No processes added. Add a process to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessManager;
