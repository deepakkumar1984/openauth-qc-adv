
import React from 'react';

interface ProgressBarProps {
  progress: number; // Percentage from 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const displayProgress = Math.max(0, Math.min(100, progress)); // Clamp progress

  return (
    <div className="mb-8 p-4 bg-slate-700/50 rounded-lg shadow">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-quantum-particle">Adventure Progress</span>
        <span className="text-sm font-medium text-quantum-particle">{Math.round(displayProgress)}%</span>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-4">
        <div
          className="bg-quantum-glow h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>
    </div>
  );
};
