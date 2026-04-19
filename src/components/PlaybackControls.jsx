import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import './PlaybackControls.css';

const PlaybackControls = ({ 
  currentTime, 
  totalTime, 
  isPlaying, 
  onPlayPause, 
  onStepForward, 
  onStepBackward, 
  onSeek,
  speed,
  onSpeedChange
}) => {
  return (
    <div className="playback-controls glass-panel">
      <div className="scrubber-container">
        <span className="time-label">{currentTime.toFixed(1)}s</span>
        <input 
          type="range" 
          min="0" 
          max={totalTime} 
          step="0.1" 
          value={currentTime} 
          onChange={(e) => onSeek(Number(e.target.value))}
          className="scrubber"
          disabled={totalTime === 0}
        />
        <span className="time-label">{totalTime.toFixed(1)}s</span>
      </div>
      
      <div className="controls-row">
        <div className="media-buttons">
          <button 
            className="btn-media" 
            onClick={onStepBackward} 
            disabled={currentTime === 0 || isPlaying}
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            className="btn-media btn-play" 
            onClick={onPlayPause}
            disabled={totalTime === 0}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          
          <button 
            className="btn-media" 
            onClick={onStepForward} 
            disabled={currentTime >= totalTime || isPlaying}
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="speed-control">
          <label>Speed:</label>
          <select 
            value={speed} 
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="styled-select speed-select"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={2}>2.0x</option>
            <option value={4}>4.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
