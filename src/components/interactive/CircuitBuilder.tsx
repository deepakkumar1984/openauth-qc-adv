import React from 'react';
import { TrashIcon, ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { SingleQubitCircuitStep } from '../../types';

interface CircuitBuilderProps {
  steps: SingleQubitCircuitStep[];
  onRemoveStep: () => void;
  onReset: () => void;
}

const GateVisual: React.FC<{ 
  gate: string; 
  parameter?: number;
  onRemove: () => void;
}> = ({ gate, parameter, onRemove }) => {
  const getGateColor = (gate: string) => {
    switch (gate) {
      case 'X': return 'bg-red-500';
      case 'Y': return 'bg-green-500';
      case 'Z': return 'bg-blue-500';
      case 'H': return 'bg-purple-500';
      case 'S': return 'bg-indigo-500';
      case 'T': return 'bg-pink-500';
      case 'RX': return 'bg-orange-500';
      case 'RY': return 'bg-teal-500';
      case 'RZ': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group">
      <div className={`w-12 h-12 ${getGateColor(gate)} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
        {gate}
      </div>
      {parameter !== undefined && (
        <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-quantum-text-secondary">
          {parameter.toFixed(2)}
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Remove gate"
      >
        <XMarkIcon className="w-3 h-3 text-white" />
      </button>
    </div>
  );
};

const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  steps,
  onRemoveStep,
  onReset
}) => {
  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-quantum-particle">
          Circuit Builder
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onRemoveStep}
            disabled={steps.length === 0}
            className="p-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
            title="Undo last gate"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            disabled={steps.length === 0}
            className="p-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
            title="Reset circuit"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="w-8 text-sm text-quantum-text-secondary">q₀</div>
          <div className="flex-1 h-0.5 bg-slate-600"></div>
        </div>
        
        {/* Circuit visualization */}
        <div className="min-h-16 bg-slate-900/50 rounded-lg p-3 border border-slate-600">
          {steps.length === 0 ? (
            <div className="flex items-center justify-center h-10 text-slate-500 text-sm">
              Circuit is empty - select gates to build your circuit
            </div>
          ) : (
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <GateVisual
                    gate={step.gate}
                    parameter={step.parameter}
                    onRemove={() => {
                      // Remove specific step (simplified - just remove last for now)
                      onRemoveStep();
                    }}
                  />
                  {index < steps.length - 1 && (
                    <div className="w-4 h-0.5 bg-slate-600"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-quantum-text-secondary">
        <div className="flex justify-between items-center">
          <span>Gates applied: {steps.length}</span>
          <span>|0⟩ → ... → |ψ⟩</span>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs text-quantum-text-secondary">
          <div className="font-medium mb-1">Circuit sequence:</div>
          <div className="flex flex-wrap gap-1">
            {steps.map((step, index) => (
              <span key={step.id} className="inline-flex items-center">
                <span className="text-quantum-particle">{step.gate}</span>
                {step.parameter && (
                  <span className="text-slate-400">({step.parameter.toFixed(2)})</span>
                )}
                {index < steps.length - 1 && <span className="mx-1">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitBuilder;
