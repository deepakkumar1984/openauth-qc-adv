import React from 'react';
import { TrashIcon, ArrowUturnLeftIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { QuantumGate } from '../../types';

interface CircuitBuilderProps {
  numQubits: number;
  circuit: (string | null)[][]; // 2D array for [qubitIndex][stepIndex]
  onCircuitChange: (newCircuit: (string | null)[][]) => void;
  selectedGate?: QuantumGate | null; // Gate selected from the palette
}

// Helper function to convert QuantumGate enum to string
const quantumGateToString = (gate: QuantumGate): string => {
  switch (gate) {
    case QuantumGate.X: return 'X';
    case QuantumGate.Y: return 'Y';
    case QuantumGate.Z: return 'Z';
    case QuantumGate.H: return 'H';
    case QuantumGate.S: return 'S';
    case QuantumGate.T: return 'T';
    case QuantumGate.RX: return 'RX';
    case QuantumGate.RY: return 'RY';
    case QuantumGate.RZ: return 'RZ';
    default: return 'H';
  }
};

const GateVisual: React.FC<{ 
  gate: string | null; // Gate can be null for an empty slot
  onClick: () => void; // For adding/changing a gate
  onRemove?: () => void; // Optional: for removing a specific gate
}> = ({ gate, onClick, onRemove }) => {
  const getGateColor = (g: string | null) => {
    if (!g) return 'bg-slate-700 hover:bg-slate-600'; // Placeholder style
    switch (g) {
      case 'X': return 'bg-red-500';
      case 'Y': return 'bg-green-500';
      case 'Z': return 'bg-blue-500';
      case 'H': return 'bg-purple-500';
      case 'S': return 'bg-indigo-500';
      case 'T': return 'bg-pink-500';
      case 'CNOT_target': return 'bg-sky-500'; // Special visual for CNOT target
      case 'CNOT_control': return 'bg-sky-700'; // Special visual for CNOT control
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group w-12 h-12 flex items-center justify-center">
      <button
        onClick={onClick}
        className={`w-10 h-10 ${getGateColor(gate)} rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md transition-all duration-150 ease-in-out transform group-hover:scale-105`}
      >
        {gate || <PlusIcon className="w-5 h-5 text-slate-400" />}
      </button>
      {gate && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Remove gate"
        >
          <XMarkIcon className="w-2.5 h-2.5 text-white" />
        </button>
      )}
    </div>
  );
};

const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  numQubits,
  circuit,
  onCircuitChange,
  selectedGate
}) => {

  const availableGates = ['H', 'X', 'Y', 'Z', 'S', 'T']; // Add CNOT later

  const handleGatePlacement = (qubitIndex: number, stepIndex: number, gate: string | null) => {
    const newCircuit = circuit.map(q => [...q]);
    newCircuit[qubitIndex][stepIndex] = gate;
    onCircuitChange(newCircuit);
  };

  const handleCellClick = (qubitIndex: number, stepIndex: number) => {
    const currentGate = circuit[qubitIndex][stepIndex];
    
    if (!currentGate) {
      // Empty cell - place selected gate or default to first available gate
      if (selectedGate) {
        const gateString = quantumGateToString(selectedGate);
        handleGatePlacement(qubitIndex, stepIndex, gateString);
      } else {
        handleGatePlacement(qubitIndex, stepIndex, availableGates[0]);
      }
    } else {
      // Cell has a gate - cycle through available gates
      const currentIndex = availableGates.indexOf(currentGate);
      let nextGate: string | null = null;
      if (currentIndex === -1 || currentIndex === availableGates.length - 1) {
        nextGate = null; // Clear or cycle to beginning
      } else {
        nextGate = availableGates[currentIndex + 1];
      }
      handleGatePlacement(qubitIndex, stepIndex, nextGate);
    }
  };
  
  const handleRemoveGate = (qubitIndex: number, stepIndex: number) => {
    handleGatePlacement(qubitIndex, stepIndex, null);
  };

  const numSteps = circuit[0]?.length || 10; // Default to 10 if circuit is empty

  const handleResetCircuit = () => {
    const newCircuit = Array(numQubits)
      .fill(null)
      .map(() => Array(numSteps).fill(null));
    onCircuitChange(newCircuit);
  };
  
  const handleClearLastStep = () => {
    if (numSteps === 0) return;
    const newCircuit = circuit.map(qubitLine => {
        const newLine = [...qubitLine];
        if (newLine.length > 0) {
            newLine[newLine.length -1] = null;
        }
        return newLine;
    });
    onCircuitChange(newCircuit);
  };


  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-quantum-particle">
          Circuit Builder ({numQubits} Qubits)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleClearLastStep} // Placeholder
            className="p-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
            title="Clear last step (placeholder)"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCircuit}
            className="p-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
            title="Reset circuit"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 overflow-x-auto pb-2">
        {Array.from({ length: numQubits }).map((_, qubitIndex) => (
          <div key={qubitIndex} className="flex items-center space-x-1">
            <div className="w-8 text-sm text-quantum-text-secondary font-mono">
              q<sub>{qubitIndex}</sub>
            </div>
            <div className="flex-1 h-0.5 bg-slate-600"></div> {/* Initial wire part */} 
            {Array.from({ length: numSteps }).map((_, stepIndex) => (
              <React.Fragment key={stepIndex}>
                <GateVisual
                  gate={circuit[qubitIndex]?.[stepIndex] || null}
                  onClick={() => handleCellClick(qubitIndex, stepIndex)}
                  onRemove={() => handleRemoveGate(qubitIndex, stepIndex)}
                />
                {/* Connecting wire segment */}
                <div className="flex-1 h-0.5 bg-slate-600"></div> 
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 p-2 bg-slate-700/50 rounded">
        <p className="text-xs text-slate-400">
          {selectedGate 
            ? `Selected gate: ${quantumGateToString(selectedGate)}. Click an empty cell to place it.`
            : `No gate selected. Click cells to cycle through: ${availableGates.join(', ')}`
          }
        </p>
      </div>
    </div>
  );
};

export default CircuitBuilder;
