import React, { useState } from 'react';
import { QuantumGate } from '../../types';

interface GatePaletteProps {
  onGateSelect: (gate: QuantumGate, parameter?: number) => void;
}

interface GateInfo {
  gate: QuantumGate;
  name: string;
  symbol: string;
  description: string;
  color: string;
  hasParameter?: boolean;
}

const GATE_DEFINITIONS: GateInfo[] = [
  {
    gate: QuantumGate.X,
    name: 'Pauli-X',
    symbol: 'X',
    description: 'NOT gate - flips |0⟩ ↔ |1⟩',
    color: 'bg-red-500 hover:bg-red-400'
  },
  {
    gate: QuantumGate.Y,
    name: 'Pauli-Y',
    symbol: 'Y',
    description: 'Y rotation with phase',
    color: 'bg-green-500 hover:bg-green-400'
  },
  {
    gate: QuantumGate.Z,
    name: 'Pauli-Z',
    symbol: 'Z',
    description: 'Phase flip on |1⟩',
    color: 'bg-blue-500 hover:bg-blue-400'
  },
  {
    gate: QuantumGate.H,
    name: 'Hadamard',
    symbol: 'H',
    description: 'Creates superposition',
    color: 'bg-purple-500 hover:bg-purple-400'
  },
  {
    gate: QuantumGate.S,
    name: 'S Gate',
    symbol: 'S',
    description: 'Phase gate (π/2)',
    color: 'bg-indigo-500 hover:bg-indigo-400'
  },
  {
    gate: QuantumGate.T,
    name: 'T Gate',
    symbol: 'T',
    description: 'π/8 phase gate',
    color: 'bg-pink-500 hover:bg-pink-400'
  },
  {
    gate: QuantumGate.RX,
    name: 'RX',
    symbol: 'RX',
    description: 'Rotation around X-axis',
    color: 'bg-orange-500 hover:bg-orange-400',
    hasParameter: true
  },
  {
    gate: QuantumGate.RY,
    name: 'RY',
    symbol: 'RY',
    description: 'Rotation around Y-axis',
    color: 'bg-teal-500 hover:bg-teal-400',
    hasParameter: true
  },
  {
    gate: QuantumGate.RZ,
    name: 'RZ',
    symbol: 'RZ',
    description: 'Rotation around Z-axis',
    color: 'bg-cyan-500 hover:bg-cyan-400',
    hasParameter: true
  }
];

const GateButton: React.FC<{
  gateInfo: GateInfo;
  onSelect: (gate: QuantumGate, parameter?: number) => void;
}> = ({ gateInfo, onSelect }) => {
  const [showParameterInput, setShowParameterInput] = useState(false);
  const [parameter, setParameter] = useState(Math.PI / 4); // Default to π/4

  const handleClick = () => {
    if (gateInfo.hasParameter) {
      setShowParameterInput(true);
    } else {
      onSelect(gateInfo.gate);
    }
  };

  const handleParameterApply = () => {
    onSelect(gateInfo.gate, parameter);
    setShowParameterInput(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`w-full p-3 rounded-lg text-white font-bold text-lg transition-all duration-200 ${gateInfo.color} shadow-lg hover:shadow-xl transform hover:scale-105`}
        title={gateInfo.description}
      >
        {gateInfo.symbol}
      </button>
      
      {showParameterInput && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-700 rounded-lg border border-slate-600 z-10">
          <div className="text-xs text-quantum-text-secondary mb-2">
            Rotation angle (radians):
          </div>
          <input
            type="range"
            min="0"
            max={2 * Math.PI}
            step="0.1"
            value={parameter}
            onChange={(e) => setParameter(parseFloat(e.target.value))}
            className="w-full mb-2"
          />
          <div className="text-xs text-center text-quantum-text-primary mb-2">
            {parameter.toFixed(2)} rad ({(parameter * 180 / Math.PI).toFixed(1)}°)
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleParameterApply}
              className="flex-1 px-2 py-1 bg-quantum-particle hover:bg-sky-400 text-white text-xs rounded"
            >
              Apply
            </button>
            <button
              onClick={() => setShowParameterInput(false)}
              className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const GatePalette: React.FC<GatePaletteProps> = ({ onGateSelect }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <h3 className="text-lg font-semibold text-quantum-particle mb-4">
        Quantum Gates
      </h3>
      <p className="text-sm text-quantum-text-secondary mb-4">
        Click gates to apply them to your qubit
      </p>
      
      <div className="grid grid-cols-3 gap-3">
        {GATE_DEFINITIONS.map((gateInfo) => (
          <GateButton
            key={gateInfo.gate}
            gateInfo={gateInfo}
            onSelect={onGateSelect}
          />
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-700/50 rounded text-xs text-quantum-text-secondary">
        <div className="font-medium mb-1">Quick Reference:</div>
        <ul className="space-y-1">
          <li><span className="text-red-400">X</span>: Bit flip (NOT gate)</li>
          <li><span className="text-purple-400">H</span>: Creates superposition</li>
          <li><span className="text-orange-400">R</span>: Parametric rotations</li>
        </ul>
      </div>
    </div>
  );
};

export default GatePalette;
