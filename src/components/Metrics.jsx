import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Timer, Zap } from 'lucide-react';
import './Metrics.css';

const MetricCard = ({ title, value, unit, icon: Icon, delay }) => (
  <motion.div 
    className="metric-card glass-panel"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="metric-icon-wrapper">
      <Icon className="metric-icon" size={20} />
    </div>
    <div className="metric-content">
      <h3 className="metric-title">{title}</h3>
      <div className="metric-value-container">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
    </div>
  </motion.div>
);

const Metrics = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="metrics-container">
      <MetricCard 
        title="Avg Waiting Time" 
        value={metrics.averageWaitingTime.toFixed(2)} 
        unit="ms" 
        icon={Timer} 
        delay={0.1}
      />
      <MetricCard 
        title="Avg Turnaround Time" 
        value={metrics.averageTurnaroundTime.toFixed(2)} 
        unit="ms" 
        icon={Clock} 
        delay={0.2}
      />
      <MetricCard 
        title="CPU Utilization" 
        value={metrics.cpuUtilization.toFixed(1)} 
        unit="%" 
        icon={Activity} 
        delay={0.3}
      />
      <MetricCard 
        title="Throughput" 
        value={metrics.processMetrics.length > 0 ? (metrics.processMetrics.length / Math.max(...metrics.processMetrics.map(p => p.completionTime))).toFixed(2) : 0} 
        unit="proc/ms" 
        icon={Zap} 
        delay={0.4}
      />
    </div>
  );
};

export default Metrics;
