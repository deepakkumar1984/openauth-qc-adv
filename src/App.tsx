import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ModuleContent } from './components/ModuleContent';
import { MODULES } from './constants'; // Import MODULES
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage'; // Import RegisterPage
import type { Module } from './types'; // Import Module type
import { fetchApi } from './utils/api';

interface User {
  id: number;
  email: string;
  username: string;
}

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetchApi('/api/auth/me');
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  return { isAuthenticated, user, loading };
};

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-white">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  const [currentModuleIndex, setCurrentModuleIndex] = React.useState<number>(0);
  const [completedModules, setCompletedModules] = React.useState<Set<string>>(new Set());
  // const { user } = useAuth(); // user can be passed to Sidebar if needed for display

  const handleSelectModule = (index: number) => {
    setCurrentModuleIndex(index);
  };

  const currentModule: Module | undefined = MODULES[currentModuleIndex];

  const handleNextModule = () => {
    if (currentModule) {
      setCompletedModules(prev => new Set(prev).add(currentModule.id));
    }
    if (currentModuleIndex < MODULES.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    } else {
      // Potentially handle end of all modules, e.g. show a final completion message
      console.log("All modules completed!");
    }
  };

  const handlePrevModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Add route for RegisterPage */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-quantum-void text-quantum-text-primary">
                <Sidebar
                  modules={MODULES}
                  currentModuleIndex={currentModuleIndex} // Pass index
                  onSelectModule={handleSelectModule} // Correct prop name and signature
                  completedModules={completedModules}
                  // user={user} // Pass user if Sidebar needs to display user info
                />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-800">
                  {currentModule ? (
                    <ModuleContent
                      module={currentModule}
                      onNextModule={handleNextModule}
                      onPrevModule={handlePrevModule}
                      isFirstModule={currentModuleIndex === 0}
                      isLastModule={currentModuleIndex === MODULES.length - 1}
                      isModuleCompleted={completedModules.has(currentModule.id)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xl text-quantum-text-secondary">
                        Select a module to begin your Quantum Adventure!
                      </p>
                    </div>
                  )}
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
