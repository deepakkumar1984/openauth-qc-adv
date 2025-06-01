
import React, { useState, useCallback } from 'react';

interface MeasurementResult {
  qubit0: 0 | 1;
  qubit1: 0 | 1;
}

export const BellStateExplorer: React.FC = () => {
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [simulations, setSimulations] = useState<MeasurementResult[]>([]);

  const simulateMeasurement = useCallback(() => {
    // For the Bell state (|00> + |11>)/sqrt(2)
    // 50% chance of measuring |00>, 50% chance of measuring |11>
    const rand = Math.random();
    let result: MeasurementResult;
    if (rand < 0.5) {
      result = { qubit0: 0, qubit1: 0 };
    } else {
      result = { qubit0: 1, qubit1: 1 };
    }
    setMeasurement(result);
    setSimulations(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 simulations
  }, []);

  const resetSimulation = useCallback(() => {
    setMeasurement(null);
    setSimulations([]);
  }, []);

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-center">
      <h4 className="text-lg font-semibold text-quantum-particle mb-4">Bell State (|00⟩ + |11⟩)/√2 Explorer</h4>
      <p className="text-sm text-quantum-text-secondary mb-4">
        This state means Qubit 0 and Qubit 1 are perfectly correlated. If you measure one, you instantly know the state of the other.
      </p>

      <div className="my-6 flex justify-center space-x-8">
        <div className="p-4 bg-slate-700 rounded-md w-40">
          <p className="text-quantum-text-secondary text-sm">Qubit 0</p>
          <p className="text-4xl font-mono text-quantum-glow h-12">
            {measurement !== null ? measurement.qubit0 : '?'}
          </p>
        </div>
        <div className="p-4 bg-slate-700 rounded-md w-40">
          <p className="text-quantum-text-secondary text-sm">Qubit 1</p>
          <p className="text-4xl font-mono text-quantum-glow h-12">
            {measurement !== null ? measurement.qubit1 : '?'}
          </p>
        </div>
      </div>

      {measurement && (
        <p className="text-quantum-glow font-semibold my-3">
          Observation: Both qubits are {measurement.qubit0 === 0 ? '0' : '1'}! They are always the same.
        </p>
      )}

      <div className="space-x-3 mt-4">
        <button
          onClick={simulateMeasurement}
          className="px-5 py-2 bg-quantum-particle hover:bg-sky-400 text-white font-medium rounded-md shadow"
        >
          Measure Entangled Pair
        </button>
        <button
          onClick={resetSimulation}
          className="px-5 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-md shadow"
        >
          Reset
        </button>
      </div>

      {simulations.length > 0 && (
        <div className="mt-6 pt-3 border-t border-slate-600">
          <h5 className="text-md text-quantum-text-secondary mb-2">Recent Measurements:</h5>
          <ul className="text-xs text-slate-400 space-y-1">
            {simulations.map((sim, index) => (
              <li key={index}>Run {simulations.length - index}: Q0 = {sim.qubit0}, Q1 = {sim.qubit1}</li>
            ))}
          </ul>
        </div>
      )}
       <p className="text-xs text-slate-400 mt-4">Each measurement collapses the Bell state. This simulation shows outcomes of repeatedly preparing and measuring new Bell pairs.</p>
    </div>
  );
};
