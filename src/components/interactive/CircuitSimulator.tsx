
import React, { useState, useMemo, useCallback } from 'react';
import type { QubitState, CircuitStep } from '../../types';
import { QuantumGate } from '../../types';

interface CircuitSimulatorProps {
  numQubits: number; // Currently supports 1 or 2
  predefinedSteps?: CircuitStep[]; // For illustrative purposes
}

// Complex number helper (basic)
interface Complex {
  re: number;
  im: number;
}
const C = (re: number, im: number = 0): Complex => ({ re, im });
const cAdd = (a: Complex, b: Complex): Complex => C(a.re + b.re, a.im + b.im);
const cMul = (a: Complex, b: Complex): Complex => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cMagnitudeSq = (a: Complex): number => a.re * a.re + a.im * a.im;


export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({ numQubits, predefinedSteps = [] }) => {
  // State for 2 qubits: |00>, |01>, |10>, |11>
  // For simplicity, we'll use real amplitudes here, but a full sim uses complex.
  const initialTwoQubitState: Complex[] = [C(1), C(0), C(0), C(0)]; // |00>
  const initialOneQubitState: Complex[] = [C(1), C(0)]; // |0>

  const [circuitSteps, setCircuitSteps] = useState<CircuitStep[]>(predefinedSteps);
  const [qubitState, setQubitState] = useState<Complex[]>(
    numQubits === 2 ? initialTwoQubitState : initialOneQubitState
  );

  const resetCircuit = useCallback(() => {
    setCircuitSteps(predefinedSteps);
    setQubitState(numQubits === 2 ? initialTwoQubitState : initialOneQubitState);
  }, [numQubits, predefinedSteps, initialTwoQubitState, initialOneQubitState]);
  
  // Calculate final state based on circuitSteps (simplified illustrative logic)
  // A full simulation is matrix multiplication, too complex for this example scope.
  // This will be an illustrative output based on the known Bell state circuit.
  const finalStateDescription = useMemo(() => {
    if (numQubits === 2 && predefinedSteps.length === 2) {
        const hasHOnQ0 = predefinedSteps.find(step => step.qubitIndex === 0 && step.gate === QuantumGate.H);
        const hasCNOT = predefinedSteps.find(step => step.gate === QuantumGate.CNOT && step.controlQubitIndex === 0 && step.qubitIndex === 1);
        if (hasHOnQ0 && hasCNOT) {
            // This is the Bell state (|00> + |11>)/sqrt(2)
            return {
                state: [C(1/Math.SQRT2), C(0), C(0), C(1/Math.SQRT2)],
                description: "Bell State: (|00⟩ + |11⟩)/√2. Qubits are entangled!"
            };
        }
    }
    // Fallback for other cases or 1 qubit (not fully implemented here for brevity)
    if (numQubits === 1 && predefinedSteps.length === 1 && predefinedSteps[0].gate === QuantumGate.H) {
        return {
            state: [C(1/Math.SQRT2), C(1/Math.SQRT2)],
            description: "Superposition: (|0⟩ + |1⟩)/√2"
        }
    }
    
    return {
        state: numQubits === 2 ? initialTwoQubitState : initialOneQubitState,
        description: "Initial state. Add gates to see changes (full simulation not implemented here)."
    };
  }, [numQubits, predefinedSteps, initialTwoQubitState, initialOneQubitState]);

  const probabilities = useMemo(() => {
    return finalStateDescription.state.map(amplitude => cMagnitudeSq(amplitude));
  }, [finalStateDescription.state]);
  
  const stateLabels = numQubits === 2 ? ["|00⟩", "|01⟩", "|10⟩", "|11⟩"] : ["|0⟩", "|1⟩"];

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <h4 className="text-lg font-semibold text-quantum-particle mb-2">Quantum Circuit Visualizer (Illustrative)</h4>
      <p className="text-xs text-quantum-text-secondary mb-4">This demonstrates a predefined circuit. A full interactive builder is complex.</p>

      <div className="mb-6 p-3 bg-slate-900/70 rounded">
        <h5 className="text-md font-medium text-quantum-glow mb-2">Circuit Diagram:</h5>
        {circuitSteps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2 my-1 p-2 bg-slate-700 rounded text-sm">
            <span className="font-mono text-sky-300">Step {index + 1}:</span>
            {step.gate === QuantumGate.CNOT ? (
              <>
                <span>Apply <strong className="text-violet-400">{step.gate}</strong></span>
                <span>Control: Q{step.controlQubitIndex}</span>
                <span>Target: Q{step.qubitIndex}</span>
              </>
            ) : (
              <span>Apply <strong className="text-violet-400">{step.gate}</strong> to Qubit {step.qubitIndex}</span>
            )}
          </div>
        ))}
        {circuitSteps.length === 0 && <p className="text-slate-400 text-sm">No gates in circuit.</p>}
      </div>
      
      <div className="mb-6">
        <h5 className="text-md font-medium text-quantum-glow mb-2">Expected Outcome:</h5>
        <p className="text-quantum-text-primary text-sm mb-3">{finalStateDescription.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {probabilities.map((prob, i) => (
                <div key={stateLabels[i]} className="p-2 bg-slate-700 rounded">
                    <p className="text-xs text-quantum-text-secondary">{stateLabels[i]}</p>
                    <div className="w-full bg-slate-600 rounded-full h-5 my-1">
                        <div className="bg-sky-500 h-5 rounded-full" style={{ width: `${prob * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-quantum-particle">{(prob * 100).toFixed(1)}%</p>
                </div>
            ))}
        </div>
      </div>

      <button
          onClick={resetCircuit} // Although it's not interactive yet, reset is good for predefined
          className="px-5 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-md shadow"
        >
          Show Circuit
      </button>
      <p className="text-xs text-slate-400 mt-4">Note: This is a simplified illustration. Actual quantum circuit simulation involves complex matrix operations.</p>
    </div>
  );
};

