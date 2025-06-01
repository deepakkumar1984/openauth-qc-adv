
import React, { useState, useMemo, useCallback } from 'react';
import type { QubitState } from '../../types';
import { QuantumGate } from '../../types';

interface GateApplicatorProps {
  initialQubitState?: QubitState;
  availableGates?: QuantumGate[];
}

const defaultInitialState: QubitState = { alpha: 1, beta: 0 }; // Starts in |0>
const defaultAvailableGates: QuantumGate[] = [QuantumGate.H, QuantumGate.X, QuantumGate.Z];

// Helper to create a normalized state
const normalizeState = (alpha: number, beta: number): QubitState => {
  const norm = Math.sqrt(alpha * alpha + beta * beta);
  if (norm === 0) return { alpha: 1, beta: 0 };
  return { alpha: alpha / norm, beta: beta / norm };
};

export const GateApplicator: React.FC<GateApplicatorProps> = ({
  initialQubitState = defaultInitialState,
  availableGates = defaultAvailableGates
}) => {
  const [qubit, setQubit] = useState<QubitState>(normalizeState(initialQubitState.alpha, initialQubitState.beta));
  const [history, setHistory] = useState<string[]>([]);
  const [measuredValue, setMeasuredValue] = useState<0 | 1 | null>(null);

  const prob0 = useMemo(() => qubit.alpha * qubit.alpha, [qubit.alpha]);
  const prob1 = useMemo(() => qubit.beta * qubit.beta, [qubit.beta]);

  const applyGate = useCallback((gate: QuantumGate) => {
    if (measuredValue !== null) return; // Don't apply gates after measurement

    let newAlpha = qubit.alpha;
    let newBeta = qubit.beta;

    switch (gate) {
      case QuantumGate.X: // NOT gate
        newAlpha = qubit.beta;
        newBeta = qubit.alpha;
        break;
      case QuantumGate.H: // Hadamard gate
        newAlpha = (qubit.alpha + qubit.beta) / Math.SQRT2;
        newBeta = (qubit.alpha - qubit.beta) / Math.SQRT2;
        break;
      case QuantumGate.Z: // Z gate
        // newAlpha remains qubit.alpha
        newBeta = -qubit.beta;
        break;
      // CNOT would require a second qubit, not handled here
    }
    setQubit(normalizeState(newAlpha, newBeta));
    setHistory(prev => [...prev, gate]);
  }, [qubit, measuredValue]);

  const measureQubit = useCallback(() => {
    const rand = Math.random();
    if (rand < prob0) {
      setMeasuredValue(0);
      setQubit(normalizeState(1,0)); 
    } else {
      setMeasuredValue(1);
      setQubit(normalizeState(0,1));
    }
     setHistory(prev => [...prev, 'Measure']);
  }, [prob0]);

  const reset = useCallback(() => {
    setQubit(normalizeState(initialQubitState.alpha, initialQubitState.beta));
    setHistory([]);
    setMeasuredValue(null);
  }, [initialQubitState]);

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-center">
      <h4 className="text-lg font-semibold text-quantum-particle mb-4">Quantum Gate Playground</h4>
      
      {/* Qubit State Display (similar to QubitVisualizer) */}
      <div className="flex justify-around items-center mb-6">
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
         <div className="w-2/5 flex flex-col items-center">
            <p className="text-sm text-quantum-text-secondary mb-1">State Vector</p>
            <svg width="100" height="100" viewBox="-55 -55 110 110" className="border border-slate-600 rounded-full bg-slate-700/50">
                <circle cx="0" cy="0" r="45" stroke="white" strokeWidth="0.5" fill="none" />
                <line x1="0" y1="0" x2={45 * qubit.alpha} y2={-45 * qubit.beta} stroke="#0ea5e9" strokeWidth="2" />
                 <text x="0" y="-48" textAnchor="middle" fill="white" fontSize="8">|0⟩</text>
                 <text x="0" y="53" textAnchor="middle" fill="white" fontSize="8">|1⟩</text>
            </svg>
        </div>
      </div>
       <p className="text-xs text-quantum-text-primary mb-3">
          State: α={qubit.alpha.toFixed(2)}, β={qubit.beta.toFixed(2)}
      </p>

      {measuredValue !== null && (
        <p className="text-xl font-bold text-quantum-glow my-3">Measured: |{measuredValue}⟩</p>
      )}

      <div className="mb-4 space-x-2 space-y-2">
        {availableGates.map(gate => (
          <button
            key={gate}
            onClick={() => applyGate(gate)}
            disabled={measuredValue !== null}
            className="px-4 py-2 bg-quantum-glow hover:bg-violet-700 text-white font-mono rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gate}
          </button>
        ))}
      </div>
      
      <div className="space-x-3 mt-4">
        <button
          onClick={measureQubit}
          disabled={measuredValue !== null}
          className="px-5 py-2 bg-quantum-particle hover:bg-sky-400 text-white font-medium rounded-md shadow disabled:opacity-50"
        >
          Measure
        </button>
        <button
          onClick={reset}
          className="px-5 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-md shadow"
        >
          Reset
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <p className="text-sm text-quantum-text-secondary mb-1">History:</p>
          <p className="text-xs text-slate-400 break-all">{history.join(' → ')}</p>
        </div>
      )}
    </div>
  );
};
