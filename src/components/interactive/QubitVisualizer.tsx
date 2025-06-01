
import React, { useState, useMemo } from 'react';
import type { QubitState } from '../../types';

interface QubitVisualizerProps {
  initialAlpha?: number;
  initialBeta?: number;
}

// Helper to create a normalized state from unnormalized alpha, beta
const createNormalizedState = (alpha: number, beta: number): QubitState => {
  const norm = Math.sqrt(alpha * alpha + beta * beta);
  if (norm === 0) return { alpha: 1, beta: 0 }; // Default to |0> if norm is 0
  return { alpha: alpha / norm, beta: beta / norm };
};

export const QubitVisualizer: React.FC<QubitVisualizerProps> = ({ initialAlpha = 1, initialBeta = 0 }) => {
  const [qubit, setQubit] = useState<QubitState>(createNormalizedState(initialAlpha, initialBeta));
  const [measuredValue, setMeasuredValue] = useState<0 | 1 | null>(null);

  const prob0 = useMemo(() => qubit.alpha * qubit.alpha, [qubit.alpha]);
  const prob1 = useMemo(() => qubit.beta * qubit.beta, [qubit.beta]);

  const measureQubit = () => {
    const rand = Math.random();
    if (rand < prob0) {
      setMeasuredValue(0);
      setQubit({ alpha: 1, beta: 0 }); // Collapse to |0>
    } else {
      setMeasuredValue(1);
      setQubit({ alpha: 0, beta: 1 }); // Collapse to |1>
    }
  };

  const resetQubit = () => {
    setQubit(createNormalizedState(initialAlpha, initialBeta));
    setMeasuredValue(null);
  };
  
  // For Bloch sphere like representation (simplified 2D)
  const angle = Math.atan2(qubit.beta, qubit.alpha) * 2; // Angle for visualization (beta can be complex, but we simplify)
  const radius = 100; // Radius of the circle
  const pointerX = radius * Math.cos(Math.PI/2 - angle/2); // Simplified mapping
  const pointerY = radius * Math.sin(Math.PI/2 - angle/2);


  return (
    <div className="text-center p-4 rounded-lg bg-slate-800 border border-slate-700">
      <h4 className="text-lg font-semibold text-quantum-particle mb-4">Qubit State Explorer</h4>
      
      <div className="flex justify-around items-center mb-6">
        {/* Probability Bars */}
        <div className="w-2/5">
          <p className="text-sm text-quantum-text-secondary">Prob(|0⟩): {(prob0 * 100).toFixed(1)}%</p>
          <div className="w-full bg-slate-600 rounded-full h-6 mb-2">
            <div className="bg-sky-500 h-6 rounded-full" style={{ width: `${prob0 * 100}%` }}></div>
          </div>
          <p className="text-sm text-quantum-text-secondary">Prob(|1⟩): {(prob1 * 100).toFixed(1)}%</p>
          <div className="w-full bg-slate-600 rounded-full h-6">
            <div className="bg-violet-500 h-6 rounded-full" style={{ width: `${prob1 * 100}%` }}></div>
          </div>
        </div>

        {/* Simplified Bloch Sphere Representation */}
        <div className="w-2/5 flex flex-col items-center">
            <p className="text-sm text-quantum-text-secondary mb-1">State Vector (Conceptual)</p>
            <svg width="120" height="120" viewBox="-60 -60 120 120" className="border border-slate-600 rounded-full bg-slate-700/50">
                <circle cx="0" cy="0" r="50" stroke="white" strokeWidth="1" fill="none" />
                <line x1="0" y1="0" x2={50 * qubit.alpha} y2={-50 * qubit.beta} stroke="#0ea5e9" strokeWidth="2" />
                 <text x="0" y="-55" textAnchor="middle" fill="white" fontSize="10">|0⟩</text>
                 <text x="0" y="60" textAnchor="middle" fill="white" fontSize="10">|1⟩</text>
            </svg>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-quantum-text-primary">
          Current State: α = {qubit.alpha.toFixed(3)}, β = {qubit.beta.toFixed(3)}
        </p>
        {measuredValue !== null && (
          <p className="text-xl font-bold text-quantum-glow mt-2">Measured: |{measuredValue}⟩</p>
        )}
      </div>
      
      <div className="space-x-3">
        <button
          onClick={measureQubit}
          disabled={measuredValue !== null}
          className="px-4 py-2 bg-quantum-particle hover:bg-sky-400 text-white font-medium rounded-md shadow disabled:opacity-50"
        >
          Measure
        </button>
        <button
          onClick={resetQubit}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-md shadow"
        >
          Reset Qubit
        </button>
      </div>
       <p className="text-xs text-slate-400 mt-4">Note: This is a simplified visualization. Actual qubit states involve complex numbers and the Bloch sphere.</p>
    </div>
  );
};
