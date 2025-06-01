import React from 'react';

export enum QuantumConceptType {
  INFO = 'INFO',
  QUBIT_VISUALIZER = 'QUBIT_VISUALIZER',
  GATE_APPLICATION = 'GATE_APPLICATION',
  CIRCUIT_BUILDER = 'CIRCUIT_BUILDER',
  QUIZ = 'QUIZ',
  BELL_STATE = 'BELL_STATE',
  CHALLENGE_PROBLEM = 'CHALLENGE_PROBLEM',
  REFLECTION_PROMPT = 'REFLECTION_PROMPT'
}

export interface Concept {
  id: string;
  title: string;
  explanation: string | React.ReactNode; // Allow JSX for rich content
  type: QuantumConceptType;
  data?: any; // Data for interactive components
}

export interface Module {
  id: string;
  title: string;
  storyIntro: string;
  concepts: Concept[];
  summary: string;
  icon: React.ReactNode;
}

// For QubitVisualizer and GateApplication
export interface QubitState {
  alpha: number; // Amplitude for |0>
  beta: number;  // Amplitude for |1>
}

export enum QuantumGate {
  X = 'X', // Pauli-X (NOT)
  H = 'H', // Hadamard
  Z = 'Z', // Pauli-Z
  CNOT = 'CNOT' // Controlled-NOT (requires 2 qubits)
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizData {
  question: string;
  options: QuizOption[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface CircuitStep {
  qubitIndex: number; // 0 or 1 for 2-qubit system
  gate: QuantumGate;
  controlQubitIndex?: number; // For CNOT
}