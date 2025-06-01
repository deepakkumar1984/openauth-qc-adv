// filepath: /Users/deepak/Working/quantum-adv/src/utils/iconMap.tsx
import React from 'react';
import {
  AcademicCapIcon,
  SparklesIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  CodeBracketSquareIcon,
  CpuChipIcon as AlgorithmIcon,
  WrenchScrewdriverIcon as HardwareIcon,
  RocketLaunchIcon as FutureIcon,
} from '@heroicons/react/24/outline'; // Or /24/solid, ensure consistency with original design

// Helper function to get icon component by name
export const getIconByName = (iconName: string | null | undefined): React.ReactNode => {
  const commonClassName = "w-5 h-5 mr-3 text-quantum-particle"; // Matching class from constants.tsx

  if (!iconName) {
    // Return a default icon if no name is provided
    return <LightBulbIcon className={commonClassName} aria-label="Default module icon" />;
  }

  switch (iconName) {
    case 'AcademicCapIcon':
      return <AcademicCapIcon className={commonClassName} aria-label="Academic Cap Icon" />;
    case 'SparklesIcon':
      return <SparklesIcon className={commonClassName} aria-label="Sparkles Icon" />;
    case 'PuzzlePieceIcon':
      return <PuzzlePieceIcon className={commonClassName} aria-label="Puzzle Piece Icon" />;
    case 'LightBulbIcon':
      return <LightBulbIcon className={commonClassName} aria-label="Light Bulb Icon" />;
    case 'CodeBracketSquareIcon':
      return <CodeBracketSquareIcon className={commonClassName} aria-label="Code Bracket Square Icon" />;
    case 'AlgorithmIcon':
      return <AlgorithmIcon className={commonClassName} aria-label="Algorithm Icon" />;
    case 'HardwareIcon':
      return <HardwareIcon className={commonClassName} aria-label="Hardware Icon" />;
    case 'FutureIcon':
      return <FutureIcon className={commonClassName} aria-label="Future Icon" />;
    default:
      console.warn(`Icon not found for ref: ${iconName}. Using default.`);
      return <LightBulbIcon className={commonClassName} aria-label="Default module icon" />;
  }
};
