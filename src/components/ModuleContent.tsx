import React, { useState, useEffect, useCallback } from 'react';
import type { Module, Concept, QuizData } from '../types'; // Added QuizData here
import { QuantumConceptType } from '../types';
import { QubitVisualizer } from './interactive/QubitVisualizer';
import { GateApplicator } from './interactive/GateApplicator';
import { QuizPlayer } from './interactive/QuizPlayer';
import { BellStateExplorer } from './interactive/BellStateExplorer';
import { CircuitSimulator } from './interactive/CircuitSimulator';
import { QuantumWelcomeJourney } from './interactive/QuantumWelcomeJourney'; // Import the new component

interface ModuleContentProps {
  module: Omit<Module, 'icon'> & { icon: React.ReactNode };
  onNextModule: () => void;
  onPrevModule: () => void;
  isFirstModule: boolean;
  isLastModule: boolean;
  // isModuleCompleted is now determined internally by concept completion
  // onModuleComplete: () => void; // Callback when all concepts in a module are done
}

const renderInteractiveElement = (concept: Concept): React.ReactNode => {
  if (concept.data?.componentName) {
    switch (concept.data.componentName) {
      case 'QuantumWelcomeJourney':
        console.log("[ModuleContent] Rendering QuantumWelcomeJourney with concept.data:", concept.data); // DEBUG
        return <QuantumWelcomeJourney storyText={concept.data?.text} />;
      // Add cases for other custom components like WorldComparisonTool, PlanckExperimentSim, etc.
      // case 'WorldComparisonTool':
      //   return <WorldComparisonTool data={concept.data} />;
      default:
        console.warn(`[ModuleContent] Custom component "${concept.data.componentName}" not found or not handled. No interactive element will be rendered by componentName.`);
        return null; // Explicitly return null if named component not found/handled
    }
  }

  // This part is now only reached if concept.data.componentName is undefined/null.
  // Original type-based rendering (only if no componentName was specified)
  switch (concept.type) {
    case QuantumConceptType.QUBIT_VISUALIZER:
      return <QubitVisualizer initialAlpha={concept.data?.initialAlpha ?? 1} initialBeta={concept.data?.initialBeta ?? 0} />;
    case QuantumConceptType.GATE_APPLICATION:
      return <GateApplicator initialQubitState={concept.data?.initialQubitState} availableGates={concept.data?.availableGates} />;
    case QuantumConceptType.QUIZ:
      // Ensure concept.data conforms to QuizData for the QuizPlayer
      if (concept.data && typeof concept.data.question === 'string' && Array.isArray(concept.data.options)) {
        return <QuizPlayer quizData={concept.data as QuizData} />;
      }
      console.error('Quiz data is not in the expected format:', concept.data);
      return <div className="text-red-500">Error: Quiz data is invalid.</div>;
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
    case QuantumConceptType.INFO:
      // INFO types by default (without a componentName) render nothing here
      return null;
    default:
      console.warn(`[ModuleContent] Unhandled concept type "${concept.type}" without a componentName.`);
      return null;
  }
};

export const ModuleContent: React.FC<ModuleContentProps> = ({ module, onNextModule, onPrevModule, isFirstModule, isLastModule }) => {
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());

  const totalConcepts = module.concepts.length;
  const currentConcept = module.concepts[currentConceptIndex];

  // Load completed concepts from localStorage
  useEffect(() => {
    const storedCompleted = localStorage.getItem(`module-${module.id}-completedConcepts`);
    if (storedCompleted) {
      setCompletedConcepts(new Set(JSON.parse(storedCompleted)));
    } else {
      setCompletedConcepts(new Set()); // Reset for new module
    }
    setCurrentConceptIndex(0); // Reset to first concept when module changes
  }, [module.id]);

  // Save completed concepts to localStorage
  useEffect(() => {
    localStorage.setItem(`module-${module.id}-completedConcepts`, JSON.stringify(Array.from(completedConcepts)));
  }, [completedConcepts, module.id]);

  const handleNextConcept = useCallback(() => {
    if (currentConceptIndex < totalConcepts - 1) {
      setCurrentConceptIndex(prevIndex => prevIndex + 1);
    }
  }, [currentConceptIndex, totalConcepts]);

  const handlePrevConcept = useCallback(() => {
    if (currentConceptIndex > 0) {
      setCurrentConceptIndex(prevIndex => prevIndex - 1);
    }
  }, [currentConceptIndex]);

  const markConceptAsDone = useCallback(() => {
    if (currentConcept) {
      setCompletedConcepts(prevCompleted => new Set(prevCompleted).add(currentConcept.id));
      if (currentConceptIndex < totalConcepts - 1) {
        handleNextConcept();
      } else {
        // Last concept in the module is marked done
        // Potentially call onModuleComplete if all concepts are done
        // This logic can be expanded if needed
      }
    }
  }, [currentConcept, currentConceptIndex, totalConcepts, handleNextConcept]);

  const isCurrentConceptCompleted = currentConcept && completedConcepts.has(currentConcept.id);
  const areAllConceptsCompleted = completedConcepts.size === totalConcepts;

  const conceptProgress = totalConcepts > 0 ? (completedConcepts.size / totalConcepts) * 100 : 0;

  // Get the interactive element (or null if none)
  const interactiveElementNode = currentConcept ? renderInteractiveElement(currentConcept) : null;

  if (!currentConcept) {
    return (
      <div className="text-center p-10 text-quantum-text-secondary">
        <p>Loading module content or no concepts available...</p>
      </div>
    );
  }

  return (
    <article className="animate-fade-in bg-slate-800/30 shadow-2xl rounded-xl p-6 md:p-10">
      <header className="mb-8 pb-6 border-b border-slate-700 flex items-center">
        {module.icon && <div className="mr-4 text-quantum-particle text-4xl">{module.icon}</div>}
        <div>
          <h2 className="text-4xl font-bold text-quantum-particle mb-1">{module.title}</h2>
          <p className="text-lg text-quantum-text-secondary italic">{module.storyIntro}</p>
        </div>
      </header>

      {/* Progress Bar for Concepts within the Module */}
      <div className="my-6">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-quantum-text-secondary">
                Unit {currentConceptIndex + 1} of {totalConcepts}
            </span>
            <span className="text-sm font-medium text-quantum-particle">{Math.round(conceptProgress)}% Complete</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2.5">
            <div
            className="bg-quantum-glow h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${conceptProgress}%` }}
            ></div>
        </div>
      </div>

      <section key={currentConcept.id} className="animate-slide-in-left p-6 bg-slate-700/40 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold text-quantum-glow mb-4">{currentConcept.title}</h3>
        <div
          className="prose prose-invert prose-sm md:prose-base max-w-none text-quantum-text-primary leading-relaxed space-y-3"
          dangerouslySetInnerHTML={{ __html: currentConcept.explanation }}
        />
        {/* Render interactive element if it exists */}
        {interactiveElementNode && (
          <div className="mt-6 p-4 bg-slate-900/50 rounded-md border border-slate-600">
            {interactiveElementNode}
          </div>
        )}
      </section>

      {/* Navigation for Concepts */}
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={handlePrevConcept}
          disabled={currentConceptIndex === 0}
          className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
        >
          Previous Unit
        </button>
        <button
          onClick={markConceptAsDone}
          disabled={isCurrentConceptCompleted && currentConceptIndex === totalConcepts -1} // Disable if last and completed
          className={`px-5 py-2.5 font-medium rounded-lg shadow-sm transition-colors duration-200 text-sm text-white ${
            isCurrentConceptCompleted 
              ? 'bg-green-600 hover:bg-green-500' 
              : 'bg-blue-500 hover:bg-blue-400'
          } ${ (isCurrentConceptCompleted && currentConceptIndex === totalConcepts -1) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCurrentConceptCompleted 
            ? (currentConceptIndex === totalConcepts - 1 ? 'Unit Complete' : 'Done! Next Unit') 
            : 'Mark as Done'}
        </button>
        <button
          onClick={handleNextConcept}
          disabled={currentConceptIndex === totalConcepts - 1}
          className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
        >
          Next Unit
        </button>
      </div>
      
      <footer className="mt-12 pt-8 border-t border-slate-700">
        <p className="text-md text-quantum-text-secondary mb-6 p-4 bg-slate-700/30 rounded-md">{module.summary}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevModule}
            disabled={isFirstModule}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous Module
          </button>
          
          {isLastModule && areAllConceptsCompleted && (
            <p className="text-xl text-green-400 font-semibold">🎉 Adventure Complete! 🎉</p>
          )}

          {isLastModule && !areAllConceptsCompleted && (
             <button
                onClick={onNextModule} // This effectively tries to go to a "next" that doesn't exist, signaling completion
                disabled={!areAllConceptsCompleted}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed animate-pulse-slow"
             >
                Complete Adventure!
            </button>
           )}

          {!isLastModule && (
            <button
                onClick={onNextModule}
                disabled={!areAllConceptsCompleted}
                className="px-6 py-3 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {areAllConceptsCompleted ? "Next Module" : "Complete All Units to Proceed"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};