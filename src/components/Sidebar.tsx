
import React from 'react';
import type { Module } from '../types';

interface SidebarProps {
  modules: Module[];
  currentModuleIndex: number;
  onSelectModule: (index: number) => void;
  completedModules: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({ modules, currentModuleIndex, onSelectModule, completedModules }) => {
  return (
    <aside className="w-full md:w-72 bg-slate-800/50 p-6 md:p-8 border-b md:border-r border-slate-700 flex-shrink-0">
      <h1 className="text-3xl font-bold text-quantum-glow mb-2">Quantum Adventure</h1>
      <p className="text-quantum-text-secondary mb-8 text-sm">Embark on your learning journey!</p>
      <nav>
        <ul>
          {modules.map((module, index) => (
            <li key={module.id} className="mb-2">
              <button
                onClick={() => onSelectModule(index)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ease-in-out flex items-center
                  ${index === currentModuleIndex
                    ? 'bg-quantum-particle text-white shadow-lg transform scale-105'
                    : 'hover:bg-slate-700/70 hover:text-quantum-glow'
                  }
                  ${completedModules.has(module.id) && index !== currentModuleIndex ? 'bg-green-600/30 text-green-300' : ''}  
                `}
              >
                {module.icon}
                <span className="ml-1">{module.title}</span>
                {completedModules.has(module.id) && (
                  <span className="ml-auto text-xs text-green-400">(Done)</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
       <div className="mt-10 p-4 bg-slate-700/50 rounded-lg">
        <h3 className="text-lg font-semibold text-quantum-glow mb-2">Handy Tip:</h3>
        <p className="text-sm text-quantum-text-secondary">
          Quantum concepts can be mind-bending! Don't worry if it doesn't click immediately. Re-read, play with the interactives, and enjoy the mystery.
        </p>
      </div>
    </aside>
  );
};
