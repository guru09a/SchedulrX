// CPU Scheduling Algorithms

// Helper to calculate metrics
const calculateMetrics = (processes, gantt) => {
  const processMetrics = processes.map(p => ({
    ...p,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }));

  // Find completion time for each process
  gantt.forEach(block => {
    if (block.processId !== 'Idle') {
      const p = processMetrics.find(pm => pm.id === block.processId);
      if (p && block.endTime > p.completionTime) {
        p.completionTime = block.endTime;
      }
    }
  });

  let totalTurnaround = 0;
  let totalWaiting = 0;

  processMetrics.forEach(p => {
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;
    totalTurnaround += p.turnaroundTime;
    totalWaiting += p.waitingTime;
  });

  return {
    processMetrics,
    averageTurnaroundTime: processes.length ? totalTurnaround / processes.length : 0,
    averageWaitingTime: processes.length ? totalWaiting / processes.length : 0,
    cpuUtilization: (() => {
      if (gantt.length === 0) return 0;
      const totalTime = gantt[gantt.length - 1].endTime;
      if (totalTime === 0) return 0;
      const idleTime = gantt.filter(b => b.processId === 'Idle').reduce((sum, b) => sum + (b.endTime - b.startTime), 0);
      return ((totalTime - idleTime) / totalTime) * 100;
    })()
  };
};

export const solveFCFS = (processes) => {
  let time = 0;
  const gantt = [];
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  sorted.forEach(p => {
    if (time < p.arrivalTime) {
      gantt.push({ processId: 'Idle', startTime: time, endTime: p.arrivalTime });
      time = p.arrivalTime;
    }
    gantt.push({ processId: p.id, startTime: time, endTime: time + p.burstTime });
    time += p.burstTime;
  });

  return { gantt, metrics: calculateMetrics(processes, gantt) };
};

export const solveSJF = (processes) => {
  let time = 0;
  const gantt = [];
  let remaining = [...processes].map(p => ({ ...p }));
  
  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= time);
    
    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      gantt.push({ processId: 'Idle', startTime: time, endTime: nextArrival });
      time = nextArrival;
      continue;
    }
    
    // Pick shortest burst time
    available.sort((a, b) => {
      if (a.burstTime === b.burstTime) return a.arrivalTime - b.arrivalTime;
      return a.burstTime - b.burstTime;
    });
    
    const selected = available[0];
    gantt.push({ processId: selected.id, startTime: time, endTime: time + selected.burstTime });
    time += selected.burstTime;
    
    remaining = remaining.filter(p => p.id !== selected.id);
  }

  return { gantt, metrics: calculateMetrics(processes, gantt) };
};

export const solveSRTF = (processes) => {
  let time = 0;
  const gantt = [];
  let remaining = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let currentProcess = null;
  let blockStart = 0;

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= time);
    
    if (available.length === 0) {
      if (currentProcess) {
        gantt.push({ processId: currentProcess.id, startTime: blockStart, endTime: time });
        currentProcess = null;
      }
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'Idle') {
         blockStart = time;
         gantt.push({ processId: 'Idle', startTime: blockStart, endTime: nextArrival });
      } else {
         gantt[gantt.length - 1].endTime = nextArrival;
      }
      time = nextArrival;
      continue;
    }
    
    available.sort((a, b) => {
      if (a.remainingTime === b.remainingTime) return a.arrivalTime - b.arrivalTime;
      return a.remainingTime - b.remainingTime;
    });
    
    const selected = available[0];
    
    if (!currentProcess || currentProcess.id !== selected.id) {
      if (currentProcess) {
        gantt.push({ processId: currentProcess.id, startTime: blockStart, endTime: time });
      } else if (gantt.length > 0 && gantt[gantt.length - 1].processId === 'Idle') {
         // idle block handled above
      }
      currentProcess = selected;
      blockStart = time;
    }
    
    time++;
    selected.remainingTime--;
    
    if (selected.remainingTime === 0) {
      gantt.push({ processId: selected.id, startTime: blockStart, endTime: time });
      remaining = remaining.filter(p => p.id !== selected.id);
      currentProcess = null;
      blockStart = time;
    }
  }

  return { gantt, metrics: calculateMetrics(processes, gantt) };
};

export const solveRR = (processes, quantum = 2) => {
  let time = 0;
  const gantt = [];
  let remaining = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let queue = [];
  let qAddedMap = new Map(); // to keep track of added to queue

  // Initial enqueue
  let available = remaining.filter(p => p.arrivalTime <= time && !qAddedMap.has(p.id));
  available.sort((a, b) => a.arrivalTime - b.arrivalTime).forEach(p => { queue.push(p); qAddedMap.set(p.id, true); });

  while (remaining.length > 0) {
    if (queue.length === 0) {
       // if queue is empty, jump to next arrival
       const unadded = remaining.filter(p => !qAddedMap.has(p.id));
       if (unadded.length > 0) {
          const nextArrival = Math.min(...unadded.map(p => p.arrivalTime));
          gantt.push({ processId: 'Idle', startTime: time, endTime: nextArrival });
          time = nextArrival;
          let newAvailable = remaining.filter(p => p.arrivalTime <= time && !qAddedMap.has(p.id));
          newAvailable.sort((a, b) => a.arrivalTime - b.arrivalTime).forEach(p => { queue.push(p); qAddedMap.set(p.id, true); });
       }
       continue;
    }

    const current = queue.shift();
    const executeTime = Math.min(quantum, current.remainingTime);
    
    gantt.push({ processId: current.id, startTime: time, endTime: time + executeTime });
    time += executeTime;
    current.remainingTime -= executeTime;

    // Any new arrivals during this execution?
    let newAvailable = remaining.filter(p => p.arrivalTime <= time && !qAddedMap.has(p.id));
    newAvailable.sort((a, b) => a.arrivalTime - b.arrivalTime).forEach(p => { queue.push(p); qAddedMap.set(p.id, true); });

    if (current.remainingTime > 0) {
      queue.push(current);
    } else {
      remaining = remaining.filter(p => p.id !== current.id);
    }
  }

  // Combine adjacent same-process blocks
  const mergedGantt = [];
  gantt.forEach(block => {
      if (mergedGantt.length > 0 && mergedGantt[mergedGantt.length - 1].processId === block.processId) {
          mergedGantt[mergedGantt.length - 1].endTime = block.endTime;
      } else {
          mergedGantt.push({ ...block });
      }
  });

  return { gantt: mergedGantt, metrics: calculateMetrics(processes, mergedGantt) };
};

export const solvePriorityNonPreemptive = (processes) => {
  let time = 0;
  const gantt = [];
  let remaining = [...processes].map(p => ({ ...p }));
  
  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= time);
    
    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      gantt.push({ processId: 'Idle', startTime: time, endTime: nextArrival });
      time = nextArrival;
      continue;
    }
    
    // Pick highest priority (lower number = higher priority)
    available.sort((a, b) => {
      if (a.priority === b.priority) return a.arrivalTime - b.arrivalTime;
      return a.priority - b.priority;
    });
    
    const selected = available[0];
    gantt.push({ processId: selected.id, startTime: time, endTime: time + selected.burstTime });
    time += selected.burstTime;
    
    remaining = remaining.filter(p => p.id !== selected.id);
  }

  return { gantt, metrics: calculateMetrics(processes, gantt) };
};

export const solvePriorityPreemptive = (processes) => {
  let time = 0;
  const gantt = [];
  let remaining = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let currentProcess = null;
  let blockStart = 0;

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= time);
    
    if (available.length === 0) {
      if (currentProcess) {
        gantt.push({ processId: currentProcess.id, startTime: blockStart, endTime: time });
        currentProcess = null;
      }
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'Idle') {
         blockStart = time;
         gantt.push({ processId: 'Idle', startTime: blockStart, endTime: nextArrival });
      } else {
         gantt[gantt.length - 1].endTime = nextArrival;
      }
      time = nextArrival;
      continue;
    }
    
    // Priority: Lower number is higher priority
    available.sort((a, b) => {
      if (a.priority === b.priority) return a.arrivalTime - b.arrivalTime;
      return a.priority - b.priority;
    });
    
    const selected = available[0];
    
    if (!currentProcess || currentProcess.id !== selected.id) {
      if (currentProcess) {
        gantt.push({ processId: currentProcess.id, startTime: blockStart, endTime: time });
      }
      currentProcess = selected;
      blockStart = time;
    }
    
    time++;
    selected.remainingTime--;
    
    if (selected.remainingTime === 0) {
      gantt.push({ processId: selected.id, startTime: blockStart, endTime: time });
      remaining = remaining.filter(p => p.id !== selected.id);
      currentProcess = null;
      blockStart = time;
    }
  }
  
  // Combine adjacent
  const mergedGantt = [];
  gantt.forEach(block => {
      if (mergedGantt.length > 0 && mergedGantt[mergedGantt.length - 1].processId === block.processId) {
          mergedGantt[mergedGantt.length - 1].endTime = block.endTime;
      } else {
          mergedGantt.push({ ...block });
      }
  });

  return { gantt: mergedGantt, metrics: calculateMetrics(processes, mergedGantt) };
};

export const solveAlgorithm = (algorithm, processes, quantum) => {
  if (processes.length === 0) return { gantt: [], metrics: calculateMetrics([], []) };
  switch (algorithm) {
    case 'FCFS': return solveFCFS(processes);
    case 'SJF': return solveSJF(processes);
    case 'SRTF': return solveSRTF(processes);
    case 'RR': return solveRR(processes, quantum);
    case 'Priority': return solvePriorityNonPreemptive(processes);
    case 'Priority (Preemptive)': return solvePriorityPreemptive(processes);
    default: return solveFCFS(processes);
  }
};
