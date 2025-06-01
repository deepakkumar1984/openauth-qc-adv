import React from 'react';
import type { Module, Concept } from '../types';
import { QuantumConceptType } from '../types';
import { QubitVisualizer } from './interactive/QubitVisualizer';
import { GateApplicator } from './interactive/GateApplicator';
import { QuizPlayer } from './interactive/QuizPlayer';
import { BellStateExplorer } from './interactive/BellStateExplorer';
import { CircuitSimulator } from './interactive/CircuitSimulator';

interface ModuleContentProps {
  module: Omit<Module, 'icon'> & { icon: React.ReactNode }; // Expect ReactNode for icon
  onNextModule: () => void;
  onPrevModule: () => void;
  isFirstModule: boolean;
  isLastModule: boolean;
  isModuleCompleted: boolean;
}

const renderInteractiveElement = (concept: Concept): React.ReactNode => {
  switch (concept.type) {
    case QuantumConceptType.QUBIT_VISUALIZER:
      return <QubitVisualizer initialAlpha={concept.data?.initialAlpha ?? 1} initialBeta={concept.data?.initialBeta ?? 0} />;
    case QuantumConceptType.GATE_APPLICATION:
      return <GateApplicator initialQubitState={concept.data?.initialQubitState} availableGates={concept.data?.availableGates} />;
    case QuantumConceptType.QUIZ:
      return <QuizPlayer quizData={concept.data} />;
    case QuantumConceptType.BELL_STATE:
      return <BellStateExplorer />;
    case QuantumConceptType.CIRCUIT_BUILDER:
       return <CircuitSimulator numQubits={concept.data?.numQubits ?? 2} predefinedSteps={concept.data?.initialSteps} />;
    case QuantumConceptType.CHALLENGE_PROBLEM:
      return (
        <div className="p-4 bg-slate-700/70 rounded-md border border-slate-600">
          <h5 className="text-md font-semibold text-quantum-particle mb-2">Challenge Problem!</h5>
          <div className="prose prose-invert prose-sm md:prose-base max-w-none text-quantum-text-secondary leading-relaxed space-y-2">
            {typeof concept.data?.description === 'string' ? <p>{concept.data.description}</p> : <p>Solve the challenge described in the main explanation above.</p>}
          </div>
          {/* Future: Could add input fields or specific interactive elements for the challenge */}
           <p className="text-xs text-slate-400 mt-3">This is a conceptual challenge. Think through the problem based on what you've learned.</p>
        </div>
      );
    case QuantumConceptType.REFLECTION_PROMPT:
      return (
        <div className="p-4 bg-slate-700/70 rounded-md border border-slate-600">
          <h5 className="text-md font-semibold text-quantum-particle mb-2">Reflect and Ponder...</h5>
           <div className="prose prose-invert prose-sm md:prose-base max-w-none text-quantum-text-secondary leading-relaxed space-y-2">
            {typeof concept.data?.prompt === 'string' ? <p>{concept.data.prompt}</p> : <p>Consider the question posed in the main explanation above.</p>}
          </div>
          {/* Future: Could add a textarea for user input and save reflections */}
          <p className="text-xs text-slate-400 mt-3">There's no single right answer here. The goal is to think critically and creatively!</p>
        </div>
      );
    default:
      return null;
  }
};


export const ModuleContent: React.FC<ModuleContentProps> = ({ module, onNextModule, onPrevModule, isFirstModule, isLastModule, isModuleCompleted }) => {
  return (
    <article className="animate-fade-in bg-slate-800/30 shadow-2xl rounded-xl p-6 md:p-10">
      <header className="mb-8 pb-6 border-b border-slate-700 flex items-center">
        {module.icon && <div className="mr-4 text-quantum-particle">{module.icon}</div>} {/* Display icon if provided */}
        <div>
            <h2 className="text-4xl font-bold text-quantum-particle mb-1">{module.title}</h2>
            <p className="text-lg text-quantum-text-secondary italic">{module.storyIntro}</p>
        </div>
      </header>

      <div className="space-y-10">
        {module.concepts.map((concept, index) => (
          <section key={concept.id} className="animate-slide-in-left p-6 bg-slate-700/40 rounded-lg shadow-lg" style={{ animationDelay: `${index * 100}ms`}}>
            <h3 className="text-2xl font-semibold text-quantum-glow mb-4">{concept.title}</h3>
            <div 
              className="prose prose-invert prose-sm md:prose-base max-w-none text-quantum-text-primary leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: concept.explanation }} // Render HTML string
            />
            {concept.type !== QuantumConceptType.INFO && (
              <div className="mt-6 p-4 bg-slate-900/50 rounded-md border border-slate-600">
                {renderInteractiveElement(concept)}
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-700">
        <p className="text-md text-quantum-text-secondary mb-6 p-4 bg-slate-700/30 rounded-md">{module.summary}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevModule}
            disabled={isFirstModule}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          {isLastModule && isModuleCompleted && (
            <p className="text-xl text-green-400 font-semibold">🎉 Adventure Complete! 🎉</p>
          )}
           {isLastModule && !isModuleCompleted && (
             <button
                onClick={onNextModule} // This will mark as complete
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 animate-pulse-slow"
             >
                Complete Adventure!
            </button>
           )}
          {!isLastModule && (
            <button
                onClick={onNextModule}
                className="px-6 py-3 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
                {isModuleCompleted ? "Next Module" : "Mark as Done & Next"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};