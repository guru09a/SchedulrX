import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProcessStateBoard.css';

const ProcessStateBoard = ({ processes, gantt, currentTime }) => {
  if (!processes || processes.length === 0 || !gantt || gantt.length === 0) {
    return null;
  }

  // Calculate completion times for all processes based on full Gantt chart
  const completionTimes = {};
  gantt.forEach(block => {
    if (block.processId !== 'Idle') {
      if (!completionTimes[block.processId] || block.endTime > completionTimes[block.processId]) {
        completionTimes[block.processId] = block.endTime;
      }
    }
  });

  const ready = [];
  const running = [];
  const completed = [];

  processes.forEach(p => {
    if (p.arrivalTime > currentTime) {
      // hasn't arrived yet
      return;
    }

    const compTime = completionTimes[p.id];
    if (compTime !== undefined && currentTime >= compTime) {
      completed.push(p);
      return;
    }

    // Is it currently running?
    const isRunning = gantt.some(b => 
      b.processId === p.id && b.startTime <= currentTime && b.endTime > currentTime
    );

    if (isRunning) {
      running.push(p);
    } else {
      ready.push(p);
    }
  });

  const renderProcessCard = (p) => (
    <motion.div 
      key={p.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="process-card"
    >
      <span className="process-card-id">{p.id}</span>
      <div className="process-card-details">
        <span>AT: {p.arrivalTime}</span>
        <span>BT: {p.burstTime}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="state-board">
      <div className="state-column ready-column">
        <h3 className="column-title">Ready Queue</h3>
        <div className="column-content">
          <AnimatePresence>
            {ready.map(renderProcessCard)}
          </AnimatePresence>
          {ready.length === 0 && <div className="empty-slot">Empty</div>}
        </div>
      </div>

      <div className="state-column running-column">
        <h3 className="column-title">Running</h3>
        <div className="column-content">
          <AnimatePresence>
            {running.map(renderProcessCard)}
          </AnimatePresence>
          {running.length === 0 && <div className="empty-slot">CPU Idle</div>}
        </div>
      </div>

      <div className="state-column completed-column">
        <h3 className="column-title">Completed</h3>
        <div className="column-content">
          <AnimatePresence>
            {completed.map(renderProcessCard)}
          </AnimatePresence>
          {completed.length === 0 && <div className="empty-slot">None</div>}
        </div>
      </div>
    </div>
  );
};

export default ProcessStateBoard;
