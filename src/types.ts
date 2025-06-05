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
  id: string; // Corresponds to LearningUnits.external_id
  title: string;
  explanation: string; // HTML string from LearningUnits.explanation
  type: QuantumConceptType; // Corresponds to LearningUnits.unit_type
  data?: {
    // Existing fields like initialAlpha, initialBeta, etc.
    initialAlpha?: number;
    initialBeta?: number;
    initialQubitState?: QubitState;
    availableGates?: QuantumGate[];
    quizData?: QuizData;
    numQubits?: number;
    initialSteps?: CircuitStep[];
    description?: string;
    prompt?: string;
    // New fields for custom components and their data
    componentName?: string; // e.g., "QuantumWelcomeJourney"
    text?: string; // For components that primarily display text like QuantumWelcomeJourney
    problemStatement?: string;
    hints?: string[];
    expectedSolution?: string;
    question?: string;
    options?: QuizOption[];
    feedbackCorrect?: string;
    feedbackIncorrect?: string;
  }; 
}

export interface Module {
  id: string; // Corresponds to CourseSections.external_id
  title: string;
  storyIntro: string;
  concepts: Concept[];
  summary: string;
  icon: React.ReactNode; // Changed from string to React.ReactNode
}

// API specific types to avoid confusion if needed, or integrate above carefully
export interface ApiLearningUnit {
  id: number; // DB primary key
  section_id: number; // Added to link to CourseSections.id
  external_id: string;
  title: string;
  explanation: string; // This will be HTML content as a string
  unit_type: string; // Will be mapped to QuantumConceptType
  unit_data: string | null; // JSON string, needs parsing
  unit_order: number;
}

export interface ApiCourseSection {
  id: number; // DB primary key
  external_id: string;
  title: string;
  icon_ref: string | null; // Name of the icon, e.g., "AcademicCapIcon"
  story_intro: string | null;
  summary: string | null;
  section_order: number;
  learning_units?: ApiLearningUnit[]; // Populated after fetching units
}

export interface ApiCourse {
  id: number; // DB primary key
  title: string;
  description: string | null;
  level: string | null;
  sections?: ApiCourseSection[]; // Populated after fetching sections
}

// For QubitVisualizer and GateApplication
export enum QuantumGate {
  X = 'X', // Pauli-X (NOT)
  Y = 'Y', // Pauli-Y
  Z = 'Z', // Pauli-Z
  H = 'H', // Hadamard
  S = 'S', // S gate (phase gate)
  T = 'T', // T gate (π/8 gate)
  RX = 'RX', // Rotation around X-axis
  RY = 'RY', // Rotation around Y-axis
  RZ = 'RZ', // Rotation around Z-axis
  CNOT = 'CNOT', // Controlled-NOT (requires 2 qubits)
  SWAP = 'SWAP', // Swap gate (requires 2 qubits)
  MEASURE = 'MEASURE' // Measurement gate
}

export interface ComplexNumber {
  re: number; // Real part
  im: number; // Imaginary part
}

export interface QubitState {
  alpha: ComplexNumber;
  beta: ComplexNumber;
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

export interface SingleQubitCircuitStep {
  id: string;
  gate: QuantumGate;
  parameter?: number; // For rotation gates
}