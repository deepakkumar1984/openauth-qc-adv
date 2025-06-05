import { ComplexNumber, QuantumGate } from '../types';

// Quantum simulator utilities for multi-qubit systems

// Helper functions for complex number operations
export const complex = (re: number, im: number = 0): ComplexNumber => ({ re, im });

export const complexAdd = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  re: a.re + b.re,
  im: a.im + b.im
});

export const complexMul = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re
});

export const complexMagnitudeSq = (a: ComplexNumber): number => a.re * a.re + a.im * a.im;

// Matrix multiplication for complex matrices
export const matrixMultiply = (A: ComplexNumber[][], B: ComplexNumber[][]): ComplexNumber[][] => {
  const rows = A.length;
  const cols = B[0].length;
  const result: ComplexNumber[][] = Array(rows).fill(null).map(() => Array(cols).fill(complex(0)));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] = complexAdd(result[i][j], complexMul(A[i][k], B[k][j]));
      }
    }
  }
  
  return result;
};

// Apply matrix to state vector
export const applyMatrix = (matrix: ComplexNumber[][], state: ComplexNumber[]): ComplexNumber[] => {
  const result: ComplexNumber[] = Array(state.length).fill(complex(0));
  
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < state.length; j++) {
      result[i] = complexAdd(result[i], complexMul(matrix[i][j], state[j]));
    }
  }
  
  return result;
};

// Quantum gate matrices
export const getGateMatrix = (gate: QuantumGate, parameter?: number): ComplexNumber[][] => {
  const sqrt2 = Math.sqrt(2);
  const inv_sqrt2 = 1 / sqrt2;
  
  switch (gate) {
    case QuantumGate.X:
      return [
        [complex(0), complex(1)],
        [complex(1), complex(0)]
      ];
    
    case QuantumGate.Y:
      return [
        [complex(0), complex(0, -1)],
        [complex(0, 1), complex(0)]
      ];
    
    case QuantumGate.Z:
      return [
        [complex(1), complex(0)],
        [complex(0), complex(-1)]
      ];
    
    case QuantumGate.H:
      return [
        [complex(inv_sqrt2), complex(inv_sqrt2)],
        [complex(inv_sqrt2), complex(-inv_sqrt2)]
      ];
    
    case QuantumGate.S:
      return [
        [complex(1), complex(0)],
        [complex(0), complex(0, 1)]
      ];
    
    case QuantumGate.T:
      return [
        [complex(1), complex(0)],
        [complex(0), complex(inv_sqrt2, inv_sqrt2)]
      ];
    
    case QuantumGate.RX:
      const cosTheta = Math.cos((parameter || 0) / 2);
      const sinTheta = Math.sin((parameter || 0) / 2);
      return [
        [complex(cosTheta), complex(0, -sinTheta)],
        [complex(0, -sinTheta), complex(cosTheta)]
      ];
    
    case QuantumGate.RY:
      const cosTheta2 = Math.cos((parameter || 0) / 2);
      const sinTheta2 = Math.sin((parameter || 0) / 2);
      return [
        [complex(cosTheta2), complex(-sinTheta2)],
        [complex(sinTheta2), complex(cosTheta2)]
      ];
    
    case QuantumGate.RZ:
      const angle = (parameter || 0) / 2;
      return [
        [complex(Math.cos(angle), -Math.sin(angle)), complex(0)],
        [complex(0), complex(Math.cos(angle), Math.sin(angle))]
      ];
    
    default:
      // Identity matrix
      return [
        [complex(1), complex(0)],
        [complex(0), complex(1)]
      ];
  }
};

// Tensor product of two matrices
export const tensorProduct = (A: ComplexNumber[][], B: ComplexNumber[][]): ComplexNumber[][] => {
  const aRows = A.length;
  const aCols = A[0].length;
  const bRows = B.length;
  const bCols = B[0].length;
  
  const result: ComplexNumber[][] = Array(aRows * bRows)
    .fill(null)
    .map(() => Array(aCols * bCols).fill(complex(0)));
  
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < aCols; j++) {
      for (let k = 0; k < bRows; k++) {
        for (let l = 0; l < bCols; l++) {
          result[i * bRows + k][j * bCols + l] = complexMul(A[i][j], B[k][l]);
        }
      }
    }
  }
  
  return result;
};

// Generate identity matrix
export const identityMatrix = (size: number): ComplexNumber[][] => {
  const matrix: ComplexNumber[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(complex(0)));
  
  for (let i = 0; i < size; i++) {
    matrix[i][i] = complex(1);
  }
  
  return matrix;
};

// Create single-qubit gate matrix for multi-qubit system
export const createSingleQubitGateMatrix = (
  gate: QuantumGate,
  targetQubit: number,
  numQubits: number,
  parameter?: number
): ComplexNumber[][] => {
  const gateMatrix = getGateMatrix(gate, parameter);
  const identity = identityMatrix(2);
  
  let result = gateMatrix;
  
  // Build the full matrix using tensor products
  for (let i = 0; i < numQubits; i++) {
    if (i === 0) {
      result = i === targetQubit ? gateMatrix : identity;
    } else {
      const currentMatrix = i === targetQubit ? gateMatrix : identity;
      result = tensorProduct(result, currentMatrix);
    }
  }
  
  return result;
};

// Simulate quantum circuit
export const simulateCircuit = (
  circuit: (string | null)[][],
  numQubits: number
): ComplexNumber[] => {
  // Initialize state to |00...0>
  const numStates = 1 << numQubits;
  let state: ComplexNumber[] = Array(numStates).fill(complex(0));
  state[0] = complex(1); // |00...0> state
  
  // Get the circuit depth (number of time steps)
  const circuitDepth = circuit[0]?.length || 0;
  
  // Apply gates column by column (time step by time step)
  for (let timeStep = 0; timeStep < circuitDepth; timeStep++) {
    // Check each qubit for gates at this time step
    for (let qubit = 0; qubit < numQubits; qubit++) {
      const gateSymbol = circuit[qubit]?.[timeStep];
      
      if (gateSymbol) {
        // Convert gate symbol to QuantumGate enum
        const gate = stringToQuantumGate(gateSymbol);
        if (gate !== null) {
          // Create the gate matrix for this qubit
          const gateMatrix = createSingleQubitGateMatrix(gate, qubit, numQubits);
          
          // Apply the gate to the state
          state = applyMatrix(gateMatrix, state);
        }
      }
    }
  }
  
  return state;
};

// Helper function to convert gate symbol string to QuantumGate enum
export const stringToQuantumGate = (gateSymbol: string): QuantumGate | null => {
  switch (gateSymbol.toUpperCase()) {
    case 'X': return QuantumGate.X;
    case 'Y': return QuantumGate.Y;
    case 'Z': return QuantumGate.Z;
    case 'H': return QuantumGate.H;
    case 'S': return QuantumGate.S;
    case 'T': return QuantumGate.T;
    case 'RX': return QuantumGate.RX;
    case 'RY': return QuantumGate.RY;
    case 'RZ': return QuantumGate.RZ;
    default: return null;
  }
};

// Helper function to convert QuantumGate enum to string
export const quantumGateToString = (gate: QuantumGate): string => {
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
    case QuantumGate.CNOT: return 'CNOT';
    default: return 'I';
  }
};
