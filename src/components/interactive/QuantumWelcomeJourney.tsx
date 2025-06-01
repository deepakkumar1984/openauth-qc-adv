import React from 'react';

interface QuantumWelcomeJourneyProps {
  // Define any props this component might need from the unit_data.text or other fields
  storyText?: string;
}

export const QuantumWelcomeJourney: React.FC<QuantumWelcomeJourneyProps> = ({ storyText }) => {
  console.log("[QuantumWelcomeJourney] Received storyText:", storyText); // DEBUG
  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-lg">
      <h4 className="text-xl font-semibold text-quantum-glow mb-3">Welcome to Your Quantum Adventure!</h4>
      {storyText ? (
        <p className="text-quantum-text-primary whitespace-pre-line">{storyText}</p>
      ) : (
        <p className="text-quantum-text-secondary italic">[Story content for QuantumWelcomeJourney is currently loading or unavailable...]</p> // Fallback UI
      )}
      <p className="mt-4 text-sm text-quantum-text-secondary">
        This is where the interactive story for 'QuantumWelcomeJourney' will unfold.
        Imagine engaging visuals and choices that guide you through the initial wonders of the quantum realm!
      </p>
      {/* Placeholder for future interactive elements */}
      <div className="mt-5 flex justify-center">
        <button className="px-4 py-2 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-md shadow-md transition-colors duration-200">
          Begin Exploration
        </button>
      </div>
    </div>
  );
};
