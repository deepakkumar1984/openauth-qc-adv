import React from 'react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-quantum-particle">Admin Dashboard</h1>
        <p className="text-lg text-quantum-text-secondary">Manage your course content.</p>
      </header>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link 
              to="/admin/courses" 
              className="text-xl text-quantum-glow hover:text-sky-400 transition-colors duration-200 p-3 bg-slate-800 rounded-md block"
            >
              Manage Courses
            </Link>
          </li>
          {/* Add links to manage sections and learning units later */}
          {/*
          <li>
            <Link 
              to="/admin/sections" 
              className="text-xl text-quantum-glow hover:text-sky-400 transition-colors duration-200 p-3 bg-slate-800 rounded-md block"
            >
              Manage Sections/Modules
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/units" 
              className="text-xl text-quantum-glow hover:text-sky-400 transition-colors duration-200 p-3 bg-slate-800 rounded-md block"
            >
              Manage Learning Units
            </Link>
          </li>
          */}
        </ul>
      </nav>
    </div>
  );
};
