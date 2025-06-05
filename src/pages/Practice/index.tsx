import React from 'react';
import { Link } from 'react-router-dom';
import { BeakerIcon, CubeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const PracticePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-void via-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-quantum-text-primary mb-4">
            Quantum Practice Lab
          </h1>
          <p className="text-xl text-quantum-text-secondary">
            Interactive quantum computing experiences to solidify your understanding
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Single Qubit Playground */}
          <Link
            to="/practice/single-qubit"
            className="group relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 hover:border-quantum-particle transition-all duration-300 hover:shadow-xl hover:shadow-quantum-particle/20"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <CubeIcon className="w-8 h-8 text-quantum-particle mr-3" />
                <h3 className="text-xl font-semibold text-quantum-text-primary">
                  Single Qubit Playground
                </h3>
              </div>
              <p className="text-quantum-text-secondary mb-4">
                Experiment with single-qubit gates and visualize quantum states on a 3D Bloch sphere. Perfect for understanding basic quantum operations.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-quantum-particle/20 text-quantum-particle text-xs rounded">
                  3D Visualization
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                  Interactive Gates
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  Real-time Feedback
                </span>
              </div>
              <div className="text-sm text-quantum-text-secondary">
                Features: X, Y, Z, H, S, T gates • Parametric rotations • Measurement simulation
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-quantum-particle/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {/* Multi-Qubit Simulator - Coming Soon */}
          <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 opacity-60">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BeakerIcon className="w-8 h-8 text-slate-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-400">
                  Multi-Qubit Simulator
                </h3>
              </div>
              <p className="text-slate-500 mb-4">
                Build and simulate complex quantum circuits with entanglement, CNOT gates, and multi-qubit measurements.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  Entanglement
                </span>
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  CNOT Gates
                </span>
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  Bell States
                </span>
              </div>
              <div className="text-sm text-slate-500">
                Coming Soon...
              </div>
            </div>
            <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
              Coming Soon
            </div>
          </div>

          {/* Algorithm Playground - Coming Soon */}
          <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 opacity-60">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="w-8 h-8 text-slate-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-400">
                  Algorithm Playground
                </h3>
              </div>
              <p className="text-slate-500 mb-4">
                Implement and visualize famous quantum algorithms like Deutsch-Jozsa, Grover's search, and Shor's algorithm.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  Deutsch-Jozsa
                </span>
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  Grover's Search
                </span>
                <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded">
                  Shor's Algorithm
                </span>
              </div>
              <div className="text-sm text-slate-500">
                Coming Soon...
              </div>
            </div>
            <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
              Coming Soon
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-quantum-text-primary mb-2">
              Ready to Practice?
            </h3>
            <p className="text-quantum-text-secondary mb-4">
              Start with the Single Qubit Playground to get familiar with quantum gates and state visualization.
            </p>
            <Link
              to="/practice/single-qubit"
              className="inline-flex items-center px-6 py-3 bg-quantum-particle hover:bg-sky-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <CubeIcon className="w-5 h-5 mr-2" />
              Launch Single Qubit Playground
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
