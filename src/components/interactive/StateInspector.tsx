import React, { useState, useMemo } from 'react';
import { EyeIcon, CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { ComplexNumber } from '../../types';

interface StateInspectorProps {
  numQubits: number; // Changed from qubitState
  amplitudes: ComplexNumber[]; // Changed from qubitState
}

// Helper functions for complex number operations
const complexAbsSq = (c: ComplexNumber): number => c.re * c.re + c.im * c.im;
const complexToString = (c: ComplexNumber, precision: number = 3): string => {
  if (Math.abs(c.im) < 1e-6) {
    return c.re.toFixed(precision);
  } else if (Math.abs(c.re) < 1e-6) {
    return `${c.im.toFixed(precision)}i`;
  } else {
    const sign = c.im >= 0 ? '+' : '';
    return `${c.re.toFixed(precision)}${sign}${c.im.toFixed(precision)}i`;
  }
};

const StateInspector: React.FC<StateInspectorProps> = ({
  numQubits,
  amplitudes
}) => {
  const [measuredValue, setMeasuredValue] = useState<number | null>(null);
  const [measurementHistory, setMeasurementHistory] = useState<number[]>([]);

  const probabilities = useMemo(() => {
    if (!Array.isArray(amplitudes)) { // Check if amplitudes is a valid array
      return []; // Return empty array if not
    }
    return amplitudes.map(amp => complexAbsSq(amp));
  }, [amplitudes]);

  const measureState = () => {
    if (probabilities.length === 0) { // Guard against empty probabilities
      return;
    }
    const rand = Math.random();
    let cumulativeProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProb += probabilities[i];
      if (rand < cumulativeProb) {
        setMeasuredValue(i);
        setMeasurementHistory(prev => [...prev, i].slice(-10)); // Keep last 10
        return;
      }
    }
    // Fallback, should ideally not happen if probabilities sum to 1
    // This part is only reached if probabilities.length > 0 AND the loop didn't return.
    const lastValidState = probabilities.length - 1;
    setMeasuredValue(lastValidState);
    setMeasurementHistory(prev => [...prev, lastValidState].slice(-10));
  };

  const resetMeasurement = () => {
    setMeasuredValue(null);
  };
  
  const performMultipleMeasurements = (count: number) => {
    if (probabilities.length === 0) { // Guard against empty probabilities
      return;
    }
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let cumulativeProb = 0;
      let measuredOutcome = amplitudes.length -1; // Default to last state
      for (let j = 0; j < probabilities.length; j++) {
        cumulativeProb += probabilities[j];
        if (rand < cumulativeProb) {
          measuredOutcome = j;
          break;
        }
      }
      results.push(measuredOutcome);
    }
    setMeasurementHistory(prev => [...prev, ...results].slice(-50)); // Keep last 50
  };

  const measurementStats = useMemo(() => {
    if (measurementHistory.length === 0) return {};
    const counts: { [key: number]: number } = {};
    measurementHistory.forEach(m => {
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [measurementHistory]);

  // Helper to format basis state, e.g., |010⟩ for 3 qubits, index 2
  // Note: Uses little-endian convention where rightmost bit = qubit 0, leftmost bit = qubit n-1
  const formatBasisState = (index: number, numQubits: number): string => {
    return `|${index.toString(2).padStart(numQubits, '0')}⟩`;
  };


  return (
    <div className="space-y-6">
      {/* State Information */}
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <div className="flex items-center mb-4">
          <CalculatorIcon className="w-5 h-5 mr-2 text-quantum-particle" />
          <h3 className="text-lg font-semibold text-quantum-particle">
            Quantum State ({numQubits} Qubits)
          </h3>
        </div>
        
        <div className="text-xs text-quantum-text-secondary mb-3 p-2 bg-slate-700 rounded">
          <strong>Qubit Ordering:</strong> |abc⟩ means rightmost bit (c) = qubit 0, leftmost bit (a) = qubit {numQubits - 1}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-quantum-text-secondary mb-1">State Vector:</div>
            <div className="font-mono text-quantum-text-primary text-xs overflow-x-auto">
              |ψ⟩ = 
              {Array.isArray(amplitudes) && amplitudes.map((amp, i) => (
                <React.Fragment key={i}>
                  {` (${complexToString(amp)})`}
                  {formatBasisState(i, numQubits)}
                  {i < amplitudes.length - 1 ? ' + ' : ''}
                </React.Fragment>
              ))}
              {/* If amplitudes is not an array, nothing will be rendered here for the state vector parts */}
            </div>
          </div>
          {/* Detailed amplitudes can be too long for multi-qubit, consider a summary or selective display */}
        </div>
      </div>

      {/* Probability Visualization */}
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="w-5 h-5 mr-2 text-quantum-particle" />
          <h3 className="text-lg font-semibold text-quantum-particle">
            Measurement Probabilities
          </h3>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {probabilities.map((prob, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-quantum-text-secondary mb-0.5">
                <span>P({formatBasisState(i, numQubits)})</span>
                <span>{(prob * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div 
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${prob * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement Panel */}
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <div className="flex items-center mb-4">
          <EyeIcon className="w-5 h-5 mr-2 text-quantum-particle" />
          <h3 className="text-lg font-semibold text-quantum-particle">
            Measurement
          </h3>
        </div>

        {measuredValue !== null ? (
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-quantum-glow mb-2">
              {formatBasisState(measuredValue, numQubits)}
            </div>
            <div className="text-sm text-quantum-text-secondary">
              System collapsed to state {formatBasisState(measuredValue, numQubits)}
            </div>
          </div>
        ) : (
          <div className="text-center mb-4 text-quantum-text-secondary">
            System is in superposition
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={measureState}
            className="flex-1 px-4 py-2 bg-quantum-particle hover:bg-sky-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Measure Once
          </button>
          {measuredValue !== null && (
            <button
              onClick={resetMeasurement}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
          )}
        </div>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => performMultipleMeasurements(10)}
            className="flex-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded"
          >
            10 Measurements
          </button>
          <button
            onClick={() => performMultipleMeasurements(100)}
            className="flex-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded"
          >
            100 Measurements
          </button>
        </div>

        {measurementHistory.length > 0 && (
          <div className="p-3 bg-slate-700/50 rounded">
            <div className="text-sm font-medium text-quantum-text-primary mb-2">
              Measurement Statistics ({measurementHistory.length} measurements):
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs max-h-40 overflow-y-auto">
              {Object.entries(measurementStats).sort(([valA], [valB]) => Number(valA) - Number(valB)).map(([val, count]) => (
                <div key={val}>
                  <span className="text-quantum-text-secondary">{formatBasisState(Number(val), numQubits)}:</span>
                  <span className="font-mono text-sky-400 ml-1">
                    {count} ({( (count / measurementHistory.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-quantum-text-secondary">
              Recent: {measurementHistory.slice(-10).map(val => formatBasisState(val, numQubits)).join(', ')}
            </div>
            <button
              onClick={() => setMeasurementHistory([])}
              className="mt-2 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Circuit Summary - This was for single qubit, might need rework for multi-qubit if kept
      {circuitSteps.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h3 className="text-lg font-semibold text-quantum-particle mb-3">
            Circuit Summary
          </h3>
          <div className="text-sm text-quantum-text-secondary">
            <div className="mb-2">Total gates applied: {circuitSteps.length}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[\'X\', \'Y\', \'Z\', \'H\', \'S\', \'T\'].map(gate => {
                const count = circuitSteps.filter(step => step.gate === gate).length;
                return count > 0 ? (
                  <div key={gate} className="flex justify-between">
                    <span>{gate}:</span>
                    <span className="text-quantum-text-primary">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default StateInspector;
