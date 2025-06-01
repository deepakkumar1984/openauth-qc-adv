import React from 'react';
import type { Module } from '../types';

export interface SidebarProps {
  modules: Array<Omit<Module, 'icon'> & { icon: React.ReactNode }>; // Expect ReactNode for icon here
  currentModuleId?: string;
  onSelectModule: (moduleId: string) => void; // Changed from index to moduleId
  // completedModules: Set<string>; // TODO: Integrate with UserProgress API
  courseTitle: string;
  // user?: User | null; // If needed for display
}

export const Sidebar: React.FC<SidebarProps> = ({ modules, currentModuleId, onSelectModule, courseTitle }) => {
  return (
    <aside className="w-80 bg-slate-900 text-quantum-text-primary p-6 space-y-6 overflow-y-auto shadow-lg">
      <div>
        <h1 className="text-2xl font-bold text-quantum-particle mb-1">{courseTitle}</h1>
        <p className="text-sm text-slate-400">Your Quantum Journey</p>
      </div>
      <nav>
        <ul className="space-y-2">
          {modules.map((module) => (
            <li key={module.id}>
              <button
                onClick={() => onSelectModule(module.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out \
                  ${currentModuleId === module.id
                    ? 'bg-quantum-primary-active text-white shadow-md'
                    : 'hover:bg-slate-700/60 text-slate-300 hover:text-white'
                  }`}
              >
                {module.icon} {/* Icon is now a ReactNode */}
                <span className="ml-3 font-medium">{module.title}</span>
                {/* TODO: Add completion check mark based on completedModules.has(module.id) */}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Optional: User profile section can be added here */}
    </aside>
  );
};
