import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Visualizer.css';

const Visualizer = ({ gantt, currentTime, totalTime }) => {
  if (!gantt || gantt.length === 0) {
    return (
      <div className="visualizer glass-panel empty-visualizer">
        <div className="placeholder-text">Run a simulation to view the Gantt Chart</div>
      </div>
    );
  }

  // Generate color based on Process ID string hash, or gray for Idle
  const getColor = (pid) => {
    if (pid === 'Idle') return 'transparent';
    const colors = [
      '#e0e7ff', // light indigo
      '#dbeafe', // light blue
      '#f3e8ff', // light purple
      '#fae8ff', // light fuchsia
      '#fce7f3', // light pink
      '#ffedd5', // light orange
      '#dcfce7', // light green
      '#f3f4f6'  // light gray
    ];
    // Simple hash from 'P1', 'P2' etc.
    const num = parseInt(pid.replace('P', '')) || 0;
    return colors[num % colors.length];
  };

  // Process Gantt chart to only show up to currentTime
  const visibleGantt = [];
  for (let block of gantt) {
    if (block.startTime >= currentTime) break; // Not started yet

    // Block has started. How much is visible?
    const blockEnd = Math.min(block.endTime, currentTime);
    visibleGantt.push({
      ...block,
      displayEndTime: blockEnd
    });
  }

  // Position of the current time indicator
  const indicatorPercentage = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className="visualizer glass-panel">
      <h2 className="visualizer-title">Gantt Chart (Real-time)</h2>
      
      <div className="gantt-container">
        <div className="gantt-chart">
          {visibleGantt.map((block, index) => {
            const widthPercentage = ((block.displayEndTime - block.startTime) / totalTime) * 100;
            const leftPercentage = (block.startTime / totalTime) * 100;
            const isIdle = block.processId === 'Idle';
            const bgColor = getColor(block.processId);
            
            return (
              <div
                key={`${block.processId}-${block.startTime}`}
                className={`gantt-block ${isIdle ? 'idle-block' : ''}`}
                style={{ 
                  position: 'absolute',
                  left: `${leftPercentage}%`,
                  width: `${widthPercentage}%`,
                  backgroundColor: isIdle ? undefined : bgColor,
                  borderColor: isIdle ? 'var(--border-color)' : bgColor,
                  borderRight: block.displayEndTime < block.endTime ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {/* Only show label if the block is wide enough */}
                {widthPercentage > 5 && (
                  <span className="block-label">{isIdle ? 'IDLE' : block.processId}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        <div 
          className="time-indicator"
          style={{ left: `${indicatorPercentage}%` }}
        />

        <div className="timeline">
          {gantt.map((block, index) => (
            <div key={`tick-${index}`} className="timeline-tick" style={{ left: `${(block.startTime / totalTime) * 100}%` }}>
              <span className="tick-label">{block.startTime}</span>
            </div>
          ))}
          <div className="timeline-tick" style={{ left: '100%' }}>
            <span className="tick-label">{totalTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
