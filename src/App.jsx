import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ProcessManager from './components/ProcessManager';
import Visualizer from './components/Visualizer';
import Metrics from './components/Metrics';
import PlaybackControls from './components/PlaybackControls';
import ProcessStateBoard from './components/ProcessStateBoard';
import { solveAlgorithm } from './utils/algorithms';

function App() {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
    { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 3 },
  ]);
  
  // Mode: 'EDIT' or 'SIMULATE'
  const [mode, setMode] = useState('EDIT');
  
  // Simulation Data
  const [simulationResult, setSimulationResult] = useState(null);
  
  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const lastUpdateRef = useRef(Date.now());
  const requestRef = useRef();

  const runSimulation = () => {
    const result = solveAlgorithm(algorithm, processes, quantum);
    setSimulationResult(result);
    setTotalTime(result.gantt.length > 0 ? result.gantt[result.gantt.length - 1].endTime : 0);
    setCurrentTime(0);
    setIsPlaying(true);
    setMode('SIMULATE');
  };

  const backToEdit = () => {
    setIsPlaying(false);
    setMode('EDIT');
    setCurrentTime(0);
  };

  // Playback Loop
  const updateTick = () => {
    const now = Date.now();
    const dt = (now - lastUpdateRef.current) / 1000; // in seconds
    lastUpdateRef.current = now;

    if (isPlaying) {
      setCurrentTime(prev => {
        let next = prev + dt * playbackSpeed;
        if (next >= totalTime) {
          setIsPlaying(false);
          return totalTime;
        }
        return next;
      });
    }
    requestRef.current = requestAnimationFrame(updateTick);
  };

  useEffect(() => {
    lastUpdateRef.current = Date.now();
    requestRef.current = requestAnimationFrame(updateTick);
    return () => cancelAnimationFrame(requestRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, playbackSpeed, totalTime]);

  // Handlers
  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const stepForward = () => {
    setIsPlaying(false);
    setCurrentTime(prev => Math.min(prev + 1, totalTime));
  };
  
  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentTime(prev => Math.max(prev - 1, 0));
  };

  const seek = (time) => {
    setCurrentTime(time);
    if (time >= totalTime) {
       setIsPlaying(false);
    }
  };

  return (
    <div className="app-container">
      <Header 
        algorithm={algorithm} 
        setAlgorithm={setAlgorithm} 
        quantum={quantum} 
        setQuantum={setQuantum} 
      />
      
      <main className="main-content">
        {mode === 'EDIT' ? (
          <div className="layout-grid-edit">
             <ProcessManager 
               processes={processes} 
               setProcesses={setProcesses} 
               runSimulation={runSimulation}
               resetSimulation={() => setProcesses([])}
             />
             <div className="edit-instructions">
                <h2>Configure your processes</h2>
                <p>Add processes, configure arrival times and burst times, select an algorithm, and click Simulate to watch the real-time event-driven visualization unfold.</p>
             </div>
          </div>
        ) : (
          <div className="layout-grid-simulate">
            <div className="simulation-header">
               <button className="btn btn-secondary" onClick={backToEdit}>← Back to Configuration</button>
               <h2 className="algorithm-badge">{algorithm} Simulation</h2>
            </div>
            
            <PlaybackControls 
              currentTime={currentTime}
              totalTime={totalTime}
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onSeek={seek}
              speed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />

            <Visualizer 
              gantt={simulationResult?.gantt} 
              currentTime={currentTime}
              totalTime={totalTime}
            />

            <ProcessStateBoard 
              processes={processes}
              gantt={simulationResult?.gantt}
              currentTime={currentTime}
            />

            {/* Show metrics dynamically based on completion, but for simplicity we can show final metrics when done, or keep them static. Here they are static for the entire run */}
            <Metrics metrics={simulationResult?.metrics} />
          </div>
        )}
      </main>

      <style>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          width: 100%;
        }
        .layout-grid-edit {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          height: calc(100vh - 150px);
        }
        .edit-instructions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
        }
        .edit-instructions h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .edit-instructions p {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .layout-grid-simulate {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .simulation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .algorithm-badge {
          background: var(--bg-primary);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .btn-secondary {
          background-color: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }
        .btn-secondary:hover {
          background-color: var(--bg-secondary);
        }
        @media (max-width: 1024px) {
          .layout-grid-edit {
            grid-template-columns: 1fr;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
