import React, { useState, useCallback } from 'react';
import CircuitBuilder from '../../components/interactive/CircuitBuilder';
import StateInspector from '../../components/interactive/StateInspector';
import GatePalette from '../../components/interactive/GatePalette';
import { ComplexNumber, QuantumGate } from '../../types';

// Temporary inline simulator until import issue is resolved
const simulateCircuit = (circuit: (string | null)[][], numQubits: number): ComplexNumber[] => {
  const numStates = 1 << numQubits;
  let state: ComplexNumber[] = Array(numStates).fill({ re: 0, im: 0 });
  
  // Initialize to |00...0> state
  if (numStates > 0) {
    state[0] = { re: 1, im: 0 };
  }
  
  // Check if circuit has any gates
  const hasGates = circuit.some(row => row.some(gate => gate !== null));
  if (!hasGates) {
    return state;
  }
  
  // Get the circuit depth (number of time steps)
  const circuitDepth = circuit[0]?.length || 0;
  
  // Apply gates column by column (time step by time step)
  for (let timeStep = 0; timeStep < circuitDepth; timeStep++) {
    // Check each qubit for gates at this time step
    for (let qubit = 0; qubit < numQubits; qubit++) {
      const gateSymbol = circuit[qubit]?.[timeStep];
      
      if (gateSymbol) {
        const newState: ComplexNumber[] = Array(numStates).fill({ re: 0, im: 0 });
        
        if (gateSymbol === 'H') {
          // Apply Hadamard gate
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const qubitValue = (i >> qubit) & 1;
              const i0 = i & ~(1 << qubit); // Set qubit to 0
              const i1 = i | (1 << qubit);  // Set qubit to 1
              
              if (qubitValue === 0) {
                // |0> -> (|0> + |1>) / sqrt(2)
                newState[i0] = { 
                  re: newState[i0].re + state[i].re * Math.sqrt(0.5), 
                  im: newState[i0].im + state[i].im * Math.sqrt(0.5) 
                };
                newState[i1] = { 
                  re: newState[i1].re + state[i].re * Math.sqrt(0.5), 
                  im: newState[i1].im + state[i].im * Math.sqrt(0.5) 
                };
              } else {
                // |1> -> (|0> - |1>) / sqrt(2)
                newState[i0] = { 
                  re: newState[i0].re + state[i].re * Math.sqrt(0.5), 
                  im: newState[i0].im + state[i].im * Math.sqrt(0.5) 
                };
                newState[i1] = { 
                  re: newState[i1].re - state[i].re * Math.sqrt(0.5), 
                  im: newState[i1].im - state[i].im * Math.sqrt(0.5) 
                };
              }
            }
          }
        } else if (gateSymbol === 'X') {
          // Apply Pauli-X (NOT gate)
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const flippedIndex = i ^ (1 << qubit);
              newState[flippedIndex] = state[i];
            }
          }
        } else if (gateSymbol === 'Y') {
          // Apply Pauli-Y gate
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const qubitValue = (i >> qubit) & 1;
              const flippedIndex = i ^ (1 << qubit);
              if (qubitValue === 0) {
                // |0> -> i|1>
                newState[flippedIndex] = { 
                  re: -state[i].im, 
                  im: state[i].re 
                };
              } else {
                // |1> -> -i|0>
                newState[flippedIndex] = { 
                  re: state[i].im, 
                  im: -state[i].re 
                };
              }
            }
          }
        } else if (gateSymbol === 'Z') {
          // Apply Pauli-Z gate (phase flip on |1>)
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const qubitValue = (i >> qubit) & 1;
              if (qubitValue === 0) {
                // |0> -> |0>
                newState[i] = state[i];
              } else {
                // |1> -> -|1>
                newState[i] = { 
                  re: -state[i].re, 
                  im: -state[i].im 
                };
              }
            }
          }
        } else if (gateSymbol === 'S') {
          // Apply S gate (phase gate π/2)
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const qubitValue = (i >> qubit) & 1;
              if (qubitValue === 0) {
                // |0> -> |0>
                newState[i] = state[i];
              } else {
                // |1> -> i|1>
                newState[i] = { 
                  re: -state[i].im, 
                  im: state[i].re 
                };
              }
            }
          }
        } else if (gateSymbol === 'T') {
          // Apply T gate (π/8 phase gate)
          for (let i = 0; i < numStates; i++) {
            if (state[i].re !== 0 || state[i].im !== 0) {
              const qubitValue = (i >> qubit) & 1;
              if (qubitValue === 0) {
                // |0> -> |0>
                newState[i] = state[i];
              } else {
                // |1> -> exp(iπ/4)|1>
                const phase = Math.PI / 4;
                const cos_phase = Math.cos(phase);
                const sin_phase = Math.sin(phase);
                newState[i] = { 
                  re: state[i].re * cos_phase - state[i].im * sin_phase, 
                  im: state[i].re * sin_phase + state[i].im * cos_phase 
                };
              }
            }
          }
        } else {
          // Unknown gate, keep state unchanged
          for (let i = 0; i < numStates; i++) {
            newState[i] = state[i];
          }
        }
        
        state = newState;
      }
    }
  }
  
  return state;
};

const initialQubitCount = 3;
const maxQubitCount = 5;

export const MultiQubitPlayground: React.FC = () => {
  const [numQubits, setNumQubits] = useState(initialQubitCount);
  const [circuit, setCircuit] = useState<(string | null)[][]>(
    Array(initialQubitCount)
      .fill(null)
      .map(() => Array(10).fill(null)) // Default circuit depth
  );
  const [quantumState, setQuantumState] = useState<ComplexNumber[] | null>(null);
  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);

  const handleGateSelect = useCallback((gate: QuantumGate, _parameter?: number) => {
    setSelectedGate(gate);
    // Store parameter if needed for rotation gates
    // For now, we'll handle this in the circuit builder
  }, []);

  const handleCircuitChange = useCallback((newCircuit: (string | null)[][]) => {
    setCircuit(newCircuit);
    
    // Calculate the actual quantum state based on the circuit
    try {
      const newState = simulateCircuit(newCircuit, numQubits);
      setQuantumState(newState);
      console.log('Circuit updated:', newCircuit);
      console.log('New quantum state:', newState);
    } catch (error) {
      console.error('Error simulating circuit:', error);
      // Fallback to initial state if simulation fails
      const numStates = 1 << numQubits;
      const initialState: ComplexNumber[] = Array(numStates).fill({ re: 0, im: 0 });
      if (numStates > 0) {
        initialState[0] = { re: 1, im: 0 }; // Initialize to |00...0> state
      }
      setQuantumState(initialState);
    }
  }, [numQubits]);

  const handleAddQubit = () => {
    if (numQubits < maxQubitCount) {
      setNumQubits(prevNumQubits => {
        const newNumQubits = prevNumQubits + 1;
        setCircuit(prevCircuit => {
          const newCircuit = [...prevCircuit];
          newCircuit.push(Array(prevCircuit[0]?.length || 10).fill(null));
          return newCircuit;
        });
        return newNumQubits;
      });
    }
  };

  const handleRemoveQubit = () => {
    if (numQubits > 1) { // Keep at least 1 qubit
      setNumQubits(prevNumQubits => {
        const newNumQubits = prevNumQubits - 1;
        setCircuit(prevCircuit => prevCircuit.slice(0, newNumQubits));
        return newNumQubits;
      });
    }
  };
  
  // Initialize quantum state when numQubits changes
  React.useEffect(() => {
    const numStates = 1 << numQubits;
    const initialState: ComplexNumber[] = Array(numStates).fill({ re: 0, im: 0 });
    if (numStates > 0) {
      initialState[0] = { re: 1, im: 0 }; // Initialize to |00...0> state
    }
    setQuantumState(initialState);
    
    // Also recalculate if there's already a circuit
    if (circuit.some(row => row.some(gate => gate !== null))) {
      try {
        const newState = simulateCircuit(circuit, numQubits);
        setQuantumState(newState);
      } catch (error) {
        console.error('Error recalculating circuit:', error);
        setQuantumState(initialState);
      }
    }
  }, [numQubits, circuit]);

  return (
    <div className="p-4 bg-slate-900 min-h-screen text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-sky-400">Multi-Qubit Playground</h1>
        <p className="text-slate-400">
          Experiment with multi-qubit circuits. Add gates, change qubits, and observe the resulting quantum state.
        </p>
      </header>

      <div className="mb-4 flex items-center space-x-4">
        <button
          onClick={handleAddQubit}
          disabled={numQubits >= maxQubitCount}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          Add Qubit ({numQubits}/{maxQubitCount})
        </button>
        <button
          onClick={handleRemoveQubit}
          disabled={numQubits <= 1}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          Remove Qubit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Gate Palette */}
        <div className="lg:col-span-1">
          <GatePalette onGateSelect={handleGateSelect} />
        </div>

        {/* Circuit Builder */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold text-sky-300 mb-4">Circuit Builder</h2>
          <CircuitBuilder
            numQubits={numQubits}
            circuit={circuit}
            onCircuitChange={handleCircuitChange}
            selectedGate={selectedGate}
          />
        </div>

        {/* State Inspector */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold text-sky-300 mb-4">State Inspector</h2>
          {quantumState ? (
            <StateInspector numQubits={numQubits} amplitudes={quantumState} />
          ) : (
            <p className="text-slate-400">Circuit state will be displayed here.</p>
          )}
        </div>
      </div>
    </div>
  );
};
