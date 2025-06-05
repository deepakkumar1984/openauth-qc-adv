import React, { useState, useMemo } from 'react';
import { EyeIcon, CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { QubitState, ComplexNumber } from '../../types';
import type { CircuitStep } from '../../pages/Practice/SingleQubitPlayground';

interface StateInspectorProps {
  qubitState: QubitState;
  circuitSteps: CircuitStep[];
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
  qubitState,
  circuitSteps
}) => {
  const [measuredValue, setMeasuredValue] = useState<0 | 1 | null>(null);
  const [measurementHistory, setMeasurementHistory] = useState<(0 | 1)[]>([]);

  // Calculate probabilities using |amplitude|^2
  const prob0 = useMemo(() => complexAbsSq(qubitState.alpha), [qubitState.alpha]);
  const prob1 = useMemo(() => complexAbsSq(qubitState.beta), [qubitState.beta]);
  
  // Calculate state purity (for pure states, this should be 1)
  const purity = useMemo(() => prob0 * prob0 + prob1 * prob1, [prob0, prob1]);
  
  // Calculate relative phase between alpha and beta
  const phase = useMemo(() => {
    const alphaPhase = Math.atan2(qubitState.alpha.im, qubitState.alpha.re);
    const betaPhase = Math.atan2(qubitState.beta.im, qubitState.beta.re);
    return betaPhase - alphaPhase;
  }, [qubitState]);

  const measureQubit = () => {
    const rand = Math.random();
    const result = rand < prob0 ? 0 : 1;
    setMeasuredValue(result);
    setMeasurementHistory(prev => [...prev, result as (0 | 1)].slice(-10)); // Keep last 10 measurements
  };

  const resetMeasurement = () => {
    setMeasuredValue(null);
  };

  const performMultipleMeasurements = (count: number) => {
    const results: (0 | 1)[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      results.push(rand < prob0 ? 0 : 1);
    }
    setMeasurementHistory(prev => [...prev, ...results].slice(-50)); // Keep last 50
  };

  const measurementStats = useMemo(() => {
    if (measurementHistory.length === 0) return { count0: 0, count1: 0, ratio0: 0, ratio1: 0 };
    
    const count0 = measurementHistory.filter(m => m === 0).length;
    const count1 = measurementHistory.filter(m => m === 1).length;
    const total = measurementHistory.length;
    
    return {
      count0,
      count1,
      ratio0: count0 / total,
      ratio1: count1 / total
    };
  }, [measurementHistory]);

  return (
    <div className="space-y-6">
      {/* State Information */}
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <div className="flex items-center mb-4">
          <CalculatorIcon className="w-5 h-5 mr-2 text-quantum-particle" />
          <h3 className="text-lg font-semibold text-quantum-particle">
            Quantum State
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-quantum-text-secondary mb-1">State Vector:</div>
            <div className="font-mono text-quantum-text-primary">
              |ψ⟩ = ({complexToString(qubitState.alpha)})|0⟩ + ({complexToString(qubitState.beta)})|1⟩
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-quantum-text-secondary mb-1">α (amplitude for |0⟩):</div>
              <div className="font-mono text-quantum-text-primary">{complexToString(qubitState.alpha, 4)}</div>
            </div>
            <div>
              <div className="text-sm text-quantum-text-secondary mb-1">β (amplitude for |1⟩):</div>
              <div className="font-mono text-quantum-text-primary">{complexToString(qubitState.beta, 4)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-quantum-text-secondary mb-1">Relative Phase:</div>
            <div className="font-mono text-quantum-text-primary">
              {phase.toFixed(3)} rad ({((phase * 180) / Math.PI).toFixed(1)}°)
            </div>
          </div>

          <div>
            <div className="text-sm text-quantum-text-secondary mb-1">State Purity:</div>
            <div className="font-mono text-quantum-text-primary">{purity.toFixed(4)}</div>
          </div>
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

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-quantum-text-secondary mb-1">
              <span>P(|0⟩)</span>
              <span>{(prob0 * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-4">
              <div 
                className="bg-sky-500 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${prob0 * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-quantum-text-secondary mb-1">
              <span>P(|1⟩)</span>
              <span>{(prob1 * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-4">
              <div 
                className="bg-violet-500 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${prob1 * 100}%` }}
              ></div>
            </div>
          </div>
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
              |{measuredValue}⟩
            </div>
            <div className="text-sm text-quantum-text-secondary">
              Qubit collapsed to {measuredValue === 0 ? 'ground' : 'excited'} state
            </div>
          </div>
        ) : (
          <div className="text-center mb-4 text-quantum-text-secondary">
            Qubit is in superposition
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={measureQubit}
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
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-quantum-text-secondary">|0⟩ outcomes:</div>
                <div className="font-mono text-sky-400">
                  {measurementStats.count0} ({(measurementStats.ratio0 * 100).toFixed(1)}%)
                </div>
              </div>
              <div>
                <div className="text-quantum-text-secondary">|1⟩ outcomes:</div>
                <div className="font-mono text-violet-400">
                  {measurementStats.count1} ({(measurementStats.ratio1 * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-quantum-text-secondary">
              Recent: {measurementHistory.slice(-10).join(', ')}
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

      {/* Circuit Summary */}
      {circuitSteps.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h3 className="text-lg font-semibold text-quantum-particle mb-3">
            Circuit Summary
          </h3>
          <div className="text-sm text-quantum-text-secondary">
            <div className="mb-2">Total gates applied: {circuitSteps.length}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['X', 'Y', 'Z', 'H', 'S', 'T'].map(gate => {
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
    </div>
  );
};

export default StateInspector;
