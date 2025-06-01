
import React, { useState } from 'react';
import type { QuizData, QuizOption } from '../../types';

interface QuizPlayerProps {
  quizData: QuizData;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizData }) => {
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!quizData) {
    return <p className="text-center text-quantum-text-secondary">No quiz data available for this section.</p>;
  }
  
  const { question, options, feedbackCorrect, feedbackIncorrect } = quizData;

  const handleOptionSelect = (option: QuizOption) => {
    if (showFeedback) return; // Don't allow changing answer after submission
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setShowFeedback(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  }

  const getButtonClass = (option: QuizOption) => {
    if (!showFeedback) {
      return selectedOption === option 
        ? 'bg-quantum-particle text-white' 
        : 'bg-slate-700 hover:bg-slate-600';
    }
    // Feedback shown
    if (option.isCorrect) return 'bg-green-500 text-white';
    if (selectedOption === option && !option.isCorrect) return 'bg-red-500 text-white';
    return 'bg-slate-600 opacity-70';
  };

  return (
    <div className="p-4 md:p-6 rounded-lg bg-slate-800 border border-slate-700">
      <h4 className="text-xl font-semibold text-quantum-glow mb-4">{question}</h4>
      <div className="space-y-3 mb-6">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            disabled={showFeedback}
            className={`w-full text-left p-3 rounded-md transition-colors duration-150 ${getButtonClass(option)}`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full px-6 py-3 bg-quantum-particle hover:bg-sky-400 text-white font-semibold rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answer
        </button>
      )}

      {showFeedback && selectedOption && (
        <div className={`mt-4 p-4 rounded-md ${selectedOption.isCorrect ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
          <p className="font-semibold text-lg">
            {selectedOption.isCorrect ? 'Correct!' : 'Not Quite...'}
          </p>
          <p>{selectedOption.isCorrect ? feedbackCorrect : feedbackIncorrect}</p>
          <button 
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white text-sm rounded-md"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
