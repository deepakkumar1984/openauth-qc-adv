import React from 'react';
import type { Module } from './types';
import { QuantumConceptType, QuantumGate } from './types';

// Heroicon-like SVGs (simplified)
export const AcademicCapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
  </svg>
);

export const LightBulbIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311V21m-3.75-2.311V21m0 0a3 3 0 01-3-3V6.75A3 3 0 019 3.75h6a3 3 0 013 3v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const CodeBracketSquareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

export const PuzzlePieceIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.597.484-1.087 1.087-1.087h.001c.603 0 1.087.49 1.087 1.087V6.75c0 .414.336.75.75.75h.375a.75.75 0 01.75.75v.375c0 .414-.336.75-.75.75h-.375a.75.75 0 01-.75-.75V9M14.25 6.087V9m0 3.375c0 .621.504 1.125 1.125 1.125h.001c.621 0 1.125-.504 1.125-1.125V9.75c0-.414.336.75.75.75h.375a.75.75 0 01.75.75v.375c0 .414-.336.75-.75.75h-.375a.75.75 0 01-.75-.75V12M14.25 12.375V15m0 3.375c0 .621.504 1.125 1.125 1.125h.001c.621 0 1.125-.504 1.125-1.125V15.75c0-.414.336.75.75.75h.375a.75.75 0 01.75.75v.375c0 .414-.336.75-.75.75h-.375a.75.75 0 01-.75-.75V18m0 0H9.375m0 0A2.625 2.625 0 016.75 15.375V15m6.75 3H9.375m0 0A2.625 2.625 0 006.75 20.625V21m6.75-3H9.375m0 0a2.625 2.625 0 01-2.625-2.625m2.625 2.625V15m0-3.375C9.375 11.004 8.87 10.5 8.25 10.5h-.001c-.621 0-1.125.504-1.125 1.125V12.375c0 .414-.336.75-.75.75H6v-.375a.75.75 0 01.75-.75H6.75V9m0 3.375V9m0-3.375C6.75 5.004 6.25 4.5 5.625 4.5h-.001C4.994 4.5 4.5 5.004 4.5 5.625V6.375c0 .414.336.75.75.75h.375a.75.75 0 01.75.75v.375c0 .414-.336.75-.75.75h-.375a.75.75 0 01-.75-.75V9m1.5-3.375V9m12-3.375V5.625c0-.621-.504-1.125-1.125-1.125h-.001c-.621 0-1.125.504-1.125 1.125V6.375c0 .414.336.75.75.75h.375a.75.75 0 01.75.75v.375c0 .414-.336.75-.75.75h-.375a.75.75 0 01-.75-.75V5.625M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.688-1.688L12 9.25l2.188-1.25a2.25 2.25 0 001.688-1.688L17 4.25l1.25 2.188a2.25 2.25 0 001.688 1.688L22.75 9.25l-2.188 1.25a2.25 2.25 0 00-1.688 1.688zM9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

// New Icon for Algorithms (reusing for now)
const AlgorithmIcon = CodeBracketSquareIcon;
// New Icon for Hardware (reusing for now)
const HardwareIcon = PuzzlePieceIcon; // Or LightBulb for innovation
// New Icon for Future (reusing for now)
const FutureIcon = SparklesIcon;


export const MODULES: Module[] = [
  {
    id: 'intro-qubits',
    title: 'The Quantum Leap: Meet the Qubit',
    icon: <AcademicCapIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Welcome, brave explorer, to the Quantum Realm! Forget everything you know about classical bits that are simply 0 or 1. We're about to meet the qubit, the mischievous and powerful hero of our story. It's a particle of pure potential!",
    concepts: [
      {
        id: 'c1-1',
        title: 'Classical Bits vs. Qubits',
        explanation: (
            <>
              <p>In classical computing, information is stored in bits, which can be either 0 or 1, like a light switch being off or on.</p>
              <p className="mt-2">Quantum computers use <strong className="text-quantum-glow">qubits</strong>. A qubit can also be 0 or 1, but thanks to a property called <strong className="text-quantum-glow">superposition</strong>, it can also be a combination of both 0 and 1 simultaneously! Imagine a spinning coin – it's neither heads nor tails until it lands. That's kind of like a qubit before measurement.</p>
            </>
          ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c1-2',
        title: 'Visualizing a Qubit',
        explanation: "Let's see what a qubit state looks like. We represent the probability of measuring a 0 or a 1. Initially, a qubit might be in state |0⟩.",
        type: QuantumConceptType.QUBIT_VISUALIZER,
        data: { initialAlpha: 1, initialBeta: 0 } // alpha for |0>, beta for |1>
      },
    ],
    summary: "You've met the qubit and seen how it's different from a classical bit. The adventure is just beginning!",
  },
  {
    id: 'superposition',
    title: 'Riding the Wave: Superposition',
    icon: <SparklesIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Our qubit hero has a superpower: superposition! This allows it to explore many possibilities at once. It's like being in multiple places at the same time, a true quantum marvel.",
    concepts: [
      {
        id: 'c2-1',
        title: 'What is Superposition?',
        explanation: "Superposition means a qubit exists in a combination of |0⟩ and |1⟩ states. The amount of each is described by 'amplitudes'. When we measure the qubit, it 'collapses' to either 0 or 1, with probabilities determined by these amplitudes.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c2-2',
        title: 'Creating Superposition with Hadamard Gate',
        explanation: "The Hadamard gate (H) is a fundamental quantum gate. Applying it to a qubit in state |0⟩ puts it into an equal superposition of |0⟩ and |1⟩. Try it yourself!",
        type: QuantumConceptType.GATE_APPLICATION,
        data: {
            initialQubitState: { alpha: 1, beta: 0 }, // Starts in |0>
            availableGates: [QuantumGate.H, QuantumGate.X, QuantumGate.Z]
        }
      },
      {
        id: 'c2-3',
        title: 'Measurement',
        explanation: "When you measure a qubit in superposition, it randomly collapses to either |0> or |1>. The probabilities are (amplitude of |0>)² and (amplitude of |1>)² respectively. After measurement, it stays in that collapsed state.",
        type: QuantumConceptType.INFO,
      }
    ],
    summary: "Superposition is a key ingredient for quantum speedup. Next, we'll see how qubits can be linked in mysterious ways.",
  },
  {
    id: 'entanglement',
    title: 'Spooky Connections: Entanglement',
    icon: <PuzzlePieceIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Imagine two coins that are linked, no matter how far apart. If one lands heads, the other instantly lands tails. This is entanglement, a 'spooky action at a distance' that baffled even Einstein!",
    concepts: [
      {
        id: 'c3-1',
        title: 'Understanding Entanglement',
        explanation: "Entanglement is a quantum phenomenon where two or more qubits become linked in such a way that their fates are intertwined. Measuring one qubit instantly influences the state of the other(s), regardless of the distance separating them. An entangled pair doesn't have individual definite states until one is measured.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c3-2',
        title: 'The Bell State: A Classic Entangled Pair',
        explanation: (
            <>
             <p>One of the simplest and most famous entangled states is the Bell state, often written as <code className="bg-slate-700 p-1 rounded text-sm">(|00⟩ + |11⟩) / √2</code>.
             This means there's a 50% chance of measuring both qubits as 0, and a 50% chance of measuring both as 1. They will always be the same!</p>
             <p className="mt-2">You can create a Bell state using a Hadamard (H) gate on the first qubit, followed by a Controlled-NOT (CNOT) gate where the first qubit is the control and the second is the target.</p>
            </>
        ),
        type: QuantumConceptType.BELL_STATE,
      },
       {
        id: 'c3-3',
        title: 'Quick Quiz!',
        explanation: "Test your understanding of entanglement and Bell states. What happens when you measure one part of an entangled pair?",
        type: QuantumConceptType.QUIZ,
        data: {
          question: "If two qubits are in the Bell state (|00⟩ + |11⟩)/√2 and you measure the first qubit to be 1, what will the second qubit be?",
          options: [
            { text: "0", isCorrect: false },
            { text: "1", isCorrect: true },
            { text: "Either 0 or 1 with 50% probability", isCorrect: false },
            { text: "In superposition", isCorrect: false },
          ],
          feedbackCorrect: "Exactly! They are perfectly correlated.",
          feedbackIncorrect: "Not quite. In this Bell state, if one is 1, the other must also be 1."
        } as any,
      }
    ],
    summary: "Entanglement is a powerful resource for quantum communication and computation. It's one of the strangest and most fascinating aspects of the quantum world.",
  },
   {
    id: 'quantum-gates',
    title: 'The Quantum Toolkit: Gates',
    icon: <LightBulbIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Just like classical computers have logic gates (AND, OR, NOT), quantum computers have quantum gates. These are the tools we use to manipulate qubits and build quantum algorithms.",
    concepts: [
      {
        id: 'c4-1',
        title: 'What are Quantum Gates?',
        explanation: "Quantum gates are operations that change the state of one or more qubits. They are represented by matrices and must be 'unitary', meaning they preserve the total probability (it always sums to 1) and are reversible.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c4-2',
        title: 'Common Single-Qubit Gates',
        explanation: (
            <>
                <p>Let's explore some common single-qubit gates:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong className="text-quantum-glow">X Gate (Pauli-X):</strong> The quantum equivalent of a NOT gate. It flips |0⟩ to |1⟩ and |1⟩ to |0⟩.</li>
                    <li><strong className="text-quantum-glow">Z Gate (Pauli-Z):</strong> Leaves |0⟩ unchanged but flips the sign of |1⟩ to -|1⟩. This is important for phase.</li>
                    <li><strong className="text-quantum-glow">H Gate (Hadamard):</strong> Creates superposition. Transforms |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2.</li>
                </ul>
                <p className="mt-2">Experiment with these gates below!</p>
            </>
        ),
        type: QuantumConceptType.GATE_APPLICATION,
         data: {
            initialQubitState: { alpha: 1, beta: 0 },
            availableGates: [QuantumGate.X, QuantumGate.H, QuantumGate.Z]
        }
      },
    ],
    summary: "You're now familiar with some basic quantum gates! These are the building blocks for more complex quantum circuits.",
  },
  {
    id: 'first-circuit',
    title: 'Your First Quantum Circuit',
    icon: <CodeBracketSquareIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "It's time to combine your knowledge! We'll build a simple quantum circuit. A quantum circuit is a sequence of quantum gates applied to qubits. Our goal: to create an entangled Bell state!",
    concepts: [
      {
        id: 'c5-1',
        title: 'Building a Bell State Circuit',
        explanation: (
          <>
            <p>To create the Bell state <code className="bg-slate-700 p-1 rounded text-sm">(|00⟩ + |11⟩) / √2</code> from an initial state of |00⟩ (both qubits are |0⟩), we need two qubits and two gates:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Apply a <strong className="text-quantum-glow">Hadamard (H) gate</strong> to the first qubit (Q0). This puts Q0 into superposition: (|0⟩ + |1⟩)/√2. The state of Q1 is still |0⟩. So, the combined state is (|00⟩ + |10⟩)/√2.</li>
              <li>Apply a <strong className="text-quantum-glow">Controlled-NOT (CNOT) gate</strong>. Q0 is the 'control' qubit, and Q1 is the 'target' qubit.
                <ul className="list-disc list-inside ml-4">
                    <li>If Q0 is |0⟩, Q1 is unchanged.</li>
                    <li>If Q0 is |1⟩, Q1 is flipped (X gate applied).</li>
                </ul>
              </li>
            </ol>
            <p className="mt-2">After the CNOT gate, if Q0 was |0⟩ (from the first part of its superposition), Q1 remains |0⟩, giving |00⟩. If Q0 was |1⟩, Q1 flips to |1⟩, giving |11⟩. The result is the entangled Bell state: (|00⟩ + |11⟩)/√2.</p>
            <p className="mt-2">This small circuit demonstrates the power of combining superposition and gate operations to create complex quantum states like entanglement.</p>
          </>
        ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c5-2',
        title: 'Visualizing the Bell State Circuit',
        explanation: "Below is a conceptual representation. Imagine applying these gates. What do you expect the measurement outcomes to be for Q0 and Q1?",
        type: QuantumConceptType.CIRCUIT_BUILDER,
        data: {
          numQubits: 2,
          initialSteps: [
            { qubitIndex: 0, gate: QuantumGate.H },
            { qubitIndex: 1, gate: QuantumGate.CNOT, controlQubitIndex: 0 }
          ]
        }
      }
    ],
    summary: "Congratulations! You've explored how to construct a basic quantum circuit to create entanglement. This is a fundamental building block in many quantum algorithms."
  },
  {
    id: 'quantum-algorithms',
    title: 'Quantum Algorithms: The Power Unleashed',
    icon: <AlgorithmIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Now that you're a master of qubits and gates, let's see how they combine to perform feats impossible for classical computers! These are quantum algorithms, the secret recipes for quantum speed.",
    concepts: [
      {
        id: 'c6-1',
        title: 'What is a Quantum Algorithm?',
        explanation: "A quantum algorithm is a step-by-step procedure performed on a quantum computer to solve a problem. They leverage principles like superposition and entanglement to achieve speedups over classical algorithms for certain tasks.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c6-2',
        title: "Deutsch's Algorithm (Simplified)",
        explanation: (
          <>
            <p>Imagine you have a function f(x) that takes a single bit (0 or 1) and returns a single bit. This function is either <strong className="text-quantum-glow">constant</strong> (f(0)=f(1)) or <strong className="text-quantum-glow">balanced</strong> (f(0)≠f(1)). Classically, you'd need to call the function twice to know. Deutsch's algorithm (and its generalization, Deutsch-Jozsa) can determine this in just <strong className="text-quantum-glow">one call</strong> using a quantum oracle and superposition!</p>
            <p className="mt-2">This was one of the first algorithms to show a quantum speedup.</p>
          </>
        ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c6-3',
        title: "Grover's Search Algorithm",
        explanation: "Imagine searching an unsorted database of N items. Classically, on average, you'd check N/2 items. Grover's algorithm can find the item in approximately √N steps! This offers a significant speedup for search problems.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c6-4',
        title: "Shor's Algorithm: The Codebreaker",
        explanation: "Shor's algorithm is famous for its ability to factor large numbers exponentially faster than any known classical algorithm. This has huge implications for cryptography, as many current encryption methods rely on the difficulty of factoring.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c6-5',
        title: 'Algorithm Think Tank Challenge',
        explanation: "Let's test your understanding of where these algorithms might shine.",
        type: QuantumConceptType.QUIZ,
        data: {
          question: "Which quantum algorithm would be most suitable for breaking modern RSA encryption by finding prime factors of a large number?",
          options: [
            { text: "Deutsch's Algorithm", isCorrect: false },
            { text: "Grover's Search Algorithm", isCorrect: false },
            { text: "Shor's Algorithm", isCorrect: true },
            { text: "Bell State Preparation Algorithm", isCorrect: false },
          ],
          feedbackCorrect: "Correct! Shor's algorithm is designed for efficient factorization.",
          feedbackIncorrect: "Not quite. While other algorithms are powerful, Shor's is specifically known for its impact on factoring and cryptography."
        }
      }
    ],
    summary: "Quantum algorithms harness quantum mechanics to solve problems in new ways. You've scratched the surface of their incredible potential!"
  },
  {
    id: 'hardware-frontier',
    title: 'Building Quantum Computers: The Hardware Frontier',
    icon: <HardwareIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "Our quantum journey takes us to the physical world. How are these amazing qubits actually built and controlled? Let's peek into the labs where scientists are taming the quantum realm.",
    concepts: [
      {
        id: 'c7-1',
        title: 'The Herculean Task: Challenges',
        explanation: (
            <>
                <p>Building quantum computers is incredibly hard! Qubits are fragile and easily disturbed by their environment (a phenomenon called <strong className="text-quantum-glow">decoherence</strong>). They need to be isolated yet controllable.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Maintaining superposition and entanglement is tough.</li>
                    <li>Scaling up to many high-quality qubits is a major hurdle.</li>
                    <li>Controlling qubits precisely requires sophisticated technology.</li>
                </ul>
            </>
        ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c7-2',
        title: 'Meet the Qubit Candidates',
        explanation: (
            <>
                <p>Scientists are exploring various physical systems to serve as qubits. Some leading candidates include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong className="text-quantum-glow">Superconducting Qubits:</strong> Tiny circuits cooled to near absolute zero. Used by companies like Google and IBM.</li>
                    <li><strong className="text-quantum-glow">Trapped Ions:</strong> Individual atoms suspended in electromagnetic fields, manipulated by lasers.</li>
                    <li><strong className="text-quantum-glow">Photonic Qubits:</strong> Qubits encoded in single particles of light (photons).</li>
                    <li>Others: Diamond NV-centers, topological qubits, neutral atoms...</li>
                </ul>
                <p className="mt-2">Each type has its own strengths and weaknesses regarding stability, scalability, and controllability.</p>
            </>
        ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c7-3',
        title: 'Quantum Error Correction: The Safety Net',
        explanation: "Because qubits are so error-prone, quantum error correction (QEC) is vital. It involves encoding the information of a single 'logical' qubit across multiple 'physical' qubits to detect and correct errors, much like classical error correction but with quantum twists.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c7-4',
        title: 'Hardware Challenge: Qubit Properties',
        explanation: "Based on what you've learned, let's see if you can identify a key property.",
        type: QuantumConceptType.QUIZ,
        data: {
          question: "Which of these is a major challenge specifically related to superconducting qubits that necessitates very low temperatures?",
          options: [
            { text: "They are difficult to entangle.", isCorrect: false },
            { text: "They are too large to scale easily.", isCorrect: false },
            { text: "They are very sensitive to thermal noise and require near absolute zero temperatures to maintain quantum states.", isCorrect: true },
            { text: "They can only be controlled by magnetic fields, not lasers.", isCorrect: false },
          ],
          feedbackCorrect: "Exactly! Superconducting qubits need extremely cold environments to minimize thermal noise and maintain their delicate quantum properties.",
          feedbackIncorrect: "Think about what 'superconducting' implies and the conditions required for such phenomena."
        }
      }
    ],
    summary: "The quest to build fault-tolerant quantum computers is an ongoing scientific and engineering marvel. Many brilliant minds are working to overcome these challenges."
  },
  {
    id: 'quantum-future',
    title: 'The Quantum Future: What\'s Next?',
    icon: <FutureIcon className="w-5 h-5 mr-3 text-quantum-particle" />,
    storyIntro: "You've journeyed far, Quantum Adventurer! You've grappled with qubits, surfed superposition waves, and even peeked at quantum algorithms. What grand tapestry does the future of quantum computing promise to weave?",
    concepts: [
      {
        id: 'c8-1',
        title: 'Revolutionizing Science & Medicine',
        explanation: (
            <>
                <p>Quantum computers could simulate molecules with unprecedented accuracy, leading to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong className="text-quantum-glow">Drug Discovery:</strong> Designing new medicines and understanding biological processes.</li>
                    <li><strong className="text-quantum-glow">Materials Science:</strong> Creating novel materials with desired properties (e.g., better superconductors, catalysts).</li>
                    <li><strong className="text-quantum-glow">Climate Change:</strong> Developing new catalysts for carbon capture or better fertilizers.</li>
                </ul>
            </>
        ),
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c8-2',
        title: 'Quantum Machine Learning',
        explanation: "Quantum algorithms could enhance machine learning by speeding up computations, improving optimization, and enabling new types of AI models. This is a rapidly growing field of research.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c8-3',
        title: 'Cryptography in the Quantum Age',
        explanation: "While Shor's algorithm threatens current encryption, quantum mechanics also offers solutions! Quantum Key Distribution (QKD) promises fundamentally secure communication. The field of post-quantum cryptography is developing new classical algorithms resistant to quantum attacks.",
        type: QuantumConceptType.INFO,
      },
      {
        id: 'c8-4',
        title: 'Final Reflection: Your Quantum Vision',
        explanation: "You've seen the potential. Now, let your imagination soar!",
        type: QuantumConceptType.REFLECTION_PROMPT,
        data: {
          prompt: "Considering everything you've learned, propose one novel application for quantum computing in an area you're passionate about. How do you think it could make a difference?"
        }
      },
      {
        id: 'c8-5',
        title: 'Your Adventure Continues...',
        explanation: "The Quantum Realm is vast and ever-expanding. This adventure was just the beginning. Keep exploring, keep learning, and perhaps one day you'll contribute to the next quantum breakthrough! Seek out further resources, research papers, and communities to deepen your understanding.",
        type: QuantumConceptType.INFO,
      }
    ],
    summary: "The quantum future is bright and full of possibilities. By understanding its principles, you are now part of this unfolding revolution. The adventure never truly ends!"
  }
];

export const TOTAL_MODULES = MODULES.length;