import React, { useState, useCallback } from 'react';
import { CleanBlochSphere } from '../../components/interactive/CleanBlochSphere';
import CircuitBuilder from '../../components/interactive/CircuitBuilder';
import GatePalette from '../../components/interactive/GatePalette';
import StateInspector from '../../components/interactive/StateInspector';
import { QuantumGate } from '../../types';
import type { QubitState, ComplexNumber, SingleQubitCircuitStep } from '../../types';

// Helper functions for complex number arithmetic
const complexAdd = (c1: ComplexNumber, c2: ComplexNumber): ComplexNumber => ({ re: c1.re + c2.re, im: c1.im + c2.im });
const complexSub = (c1: ComplexNumber, c2: ComplexNumber): ComplexNumber => ({ re: c1.re - c2.re, im: c1.im - c2.im });
const complexMul = (c1: ComplexNumber, c2: ComplexNumber): ComplexNumber => ({
  re: c1.re * c2.re - c1.im * c2.im,
  im: c1.re * c2.im + c1.im * c2.re,
});
const complexScalarMul = (s: number, c: ComplexNumber): ComplexNumber => ({ re: s * c.re, im: s * c.im });
const complexAbsSq = (c: ComplexNumber): number => c.re * c.re + c.im * c.im;

const SingleQubitPlayground: React.FC = () => {
  const [qubitState, setQubitState] = useState<QubitState>({ alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
  const [circuitSteps, setCircuitSteps] = useState<SingleQubitCircuitStep[]>([]);

  // Apply quantum gate to current state
  const applyGate = useCallback((gate: QuantumGate, parameter?: number) => {
    let currentAlpha = qubitState.alpha;
    let currentBeta = qubitState.beta;
    let nextAlpha: ComplexNumber = { ...currentAlpha };
    let nextBeta: ComplexNumber = { ...currentBeta };
    
    switch (gate) {
      case QuantumGate.X: // Pauli-X (NOT gate)
        nextAlpha = currentBeta;
        nextBeta = currentAlpha;
        break;
      case QuantumGate.Y: // Pauli-Y: [[0, -i], [i, 0]]
        nextAlpha = complexMul({ re: 0, im: -1 }, currentBeta); // -i * beta
        nextBeta = complexMul({ re: 0, im: 1 }, currentAlpha);  // i * alpha
        break;
      case QuantumGate.Z: // Pauli-Z: [[1, 0], [0, -1]]
        // nextAlpha remains currentAlpha
        nextBeta = complexScalarMul(-1, currentBeta); // -beta
        break;
      case QuantumGate.H: // Hadamard: 1/sqrt(2) * [[1, 1], [1, -1]]
        const invSqrt2 = 1 / Math.sqrt(2);
        nextAlpha = complexScalarMul(invSqrt2, complexAdd(currentAlpha, currentBeta));
        nextBeta = complexScalarMul(invSqrt2, complexSub(currentAlpha, currentBeta));
        console.log(`Hadamard gate applied:`);
        console.log(`  Input: alpha=(${currentAlpha.re.toFixed(4)}, ${currentAlpha.im.toFixed(4)}i), beta=(${currentBeta.re.toFixed(4)}, ${currentBeta.im.toFixed(4)}i)`);
        console.log(`  Output: alpha=(${nextAlpha.re.toFixed(4)}, ${nextAlpha.im.toFixed(4)}i), beta=(${nextBeta.re.toFixed(4)}, ${nextBeta.im.toFixed(4)}i)`);
        break;
      case QuantumGate.S: // S gate (Phase gate): [[1, 0], [0, i]]
        // nextAlpha remains currentAlpha
        nextBeta = complexMul({ re: 0, im: 1 }, currentBeta); // i * beta
        break;
      case QuantumGate.T: // T gate (π/4 phase gate): [[1, 0], [0, e^(iπ/4)]]
        // e^(iπ/4) = cos(π/4) + i*sin(π/4) = 1/sqrt(2) + i/sqrt(2)
        const cosPi4 = Math.cos(Math.PI / 4);
        const sinPi4 = Math.sin(Math.PI / 4);
        // nextAlpha remains currentAlpha
        nextBeta = complexMul({ re: cosPi4, im: sinPi4 }, currentBeta);
        break;
      case QuantumGate.RX: // Rotation around X-axis: [[cos(θ/2), -i*sin(θ/2)], [-i*sin(θ/2), cos(θ/2)]]
        if (parameter !== undefined) {
          const cosHalf = Math.cos(parameter / 2);
          const sinHalf = Math.sin(parameter / 2);
          const negISinHalf: ComplexNumber = { re: 0, im: -sinHalf };

          nextAlpha = complexAdd(
            complexScalarMul(cosHalf, currentAlpha),
            complexMul(negISinHalf, currentBeta)
          );
          nextBeta = complexAdd(
            complexMul(negISinHalf, currentAlpha),
            complexScalarMul(cosHalf, currentBeta)
          );
        }
        break;
      case QuantumGate.RY: // Rotation around Y-axis: [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
        if (parameter !== undefined) {
          const cosHalf = Math.cos(parameter / 2);
          const sinHalf = Math.sin(parameter / 2);
          
          nextAlpha = complexAdd(
            complexScalarMul(cosHalf, currentAlpha),
            complexScalarMul(-sinHalf, currentBeta)
          );
          nextBeta = complexAdd(
            complexScalarMul(sinHalf, currentAlpha),
            complexScalarMul(cosHalf, currentBeta)
          );
        }
        break;
      case QuantumGate.RZ: // Rotation around Z-axis: [[e^(-iθ/2), 0], [0, e^(iθ/2)]]
        if (parameter !== undefined) {
          const thetaOver2 = parameter / 2;
          const expMinusIThetaOver2: ComplexNumber = { re: Math.cos(-thetaOver2), im: Math.sin(-thetaOver2) };
          const expPlusIThetaOver2: ComplexNumber = { re: Math.cos(thetaOver2), im: Math.sin(thetaOver2) };

          nextAlpha = complexMul(expMinusIThetaOver2, currentAlpha);
          nextBeta = complexMul(expPlusIThetaOver2, currentBeta);
        }
        break;
    }

    // Normalize the state
    const normSqAlpha = complexAbsSq(nextAlpha);
    const normSqBeta = complexAbsSq(nextBeta);
    const norm = Math.sqrt(normSqAlpha + normSqBeta);

    let newState: QubitState = { alpha: nextAlpha, beta: nextBeta };
    if (norm > 1e-9) { // Avoid division by zero or tiny numbers
      newState.alpha = complexScalarMul(1 / norm, nextAlpha);
      newState.beta = complexScalarMul(1 / norm, nextBeta);
    } else {
      // This case should ideally not happen with unitary gates if starting from a valid state.
      // If it does, reset to a default state or handle error.
      // For now, just log and keep the unnormalized (likely zero) state.
      console.warn("Normalization resulted in a near-zero norm. State:", newState);
    }
    
    setQubitState(newState);
    
    // Add to circuit
    const newStep: SingleQubitCircuitStep = {
      id: Date.now().toString(),
      gate,
      parameter
    };
    setCircuitSteps(prev => [...prev, newStep]);
  }, [qubitState]);

  const resetCircuit = useCallback(() => {
    setQubitState({ alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
    setCircuitSteps([]);
  }, []);

  const removeLastStep = useCallback(() => {
    if (circuitSteps.length === 0) return;
    
    const newSteps = circuitSteps.slice(0, -1);
    setCircuitSteps(newSteps);
    
    // Recompute state from the beginning
    // For now, this resets to |0>. A full re-computation is needed for correctness.
    let recomputedState: QubitState = { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } };
    
    // TODO: Implement full re-computation by applying all gates in newSteps
    // For now, we'll just set it to the initial state if newSteps is empty,
    // or leave it as is (which is incorrect if newSteps is not empty).
    // This part needs to be replaced with a loop that calls a non-hook version of applyGate logic.
    // For the purpose of this step, we will just reset to |0> as a placeholder.
    if (newSteps.length === 0) {
      setQubitState(recomputedState);
    } else {
      // Placeholder: This is where you would iterate through newSteps and re-apply gates
      // to calculate the correct state. For now, resetting to |0> for simplicity.
      // This will be addressed in "Implement a proper undo functionality".
      console.warn("Undo: Re-computation not fully implemented. Resetting to |0⟩ for now.");
      setQubitState({ alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
    }

  }, [circuitSteps]); // Removed applyGate from dependencies as it causes infinite loops if not careful

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-void via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-quantum-text-primary mb-4">
            Single Qubit Circuit Playground
          </h1>
          <p className="text-quantum-text-secondary text-lg">
            Experiment with single-qubit gates and see the results on a 3D Bloch sphere
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Gate Palette */}
          <div className="xl:col-span-1">
            <GatePalette onGateSelect={applyGate} />
          </div>

          {/* Center Column - 3D Bloch Sphere (Larger) */}
          <div className="xl:col-span-2">
            <CleanBlochSphere 
              qubitState={qubitState} 
              width={600}
              height={500}
            />
            
            {/* Circuit Builder below Bloch Sphere */}
            <div className="mt-6">
              <CircuitBuilder 
                steps={circuitSteps} 
                onRemoveStep={removeLastStep}
                onReset={resetCircuit}
              />
            </div>
          </div>

          {/* Right Column - State Inspector */}
          <div className="xl:col-span-1">
            <StateInspector 
              qubitState={qubitState}
              circuitSteps={circuitSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleQubitPlayground;
