import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ModuleContent } from './components/ModuleContent';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { AdminCoursesPage } from './pages/Admin/AdminCoursesPage';
import { AdminSectionsPage } from './pages/Admin/AdminSectionsPage';
import { AdminLearningUnitsPage } from './pages/Admin/AdminLearningUnitsPage'; // Added
import type { Module as FrontendModule, ApiCourse, ApiCourseSection, ApiLearningUnit, QuantumConceptType as QCTEnum, Concept as FrontendConcept } from './types';
import { api } from './utils/api'; // Corrected: Use the new api object
import { getIconByName } from './utils/iconMap'; // Restoring this for icon handling

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
        // Corrected: Use api.get for the auth check
        const response = await api.get<User>('/api/auth/me');
        // The new api.get returns an object with a 'data' property upon success.
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error: any) {
        // Errors thrown by api.get will have a .data property (if server sent JSON error)
        // or .message. We assume if it fails, user is not authenticated.
        console.error('Error checking auth status:', error.data?.error || error.message);
        setIsAuthenticated(false);
        setUser(null);
      }
      finally {
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
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Admin Routes - Added Carefully */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <AdminCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route // Add route for AdminSectionsPage
          path="/admin/course/:courseId/sections"
          element={(
            <ProtectedRoute>
              <AdminSectionsPage />
            </ProtectedRoute>
          )}
        />
        <Route // Add route for AdminLearningUnitsPage
          path="/admin/course/:courseId/section/:sectionId/units"
          element={(
            <ProtectedRoute>
              <AdminLearningUnitsPage />
            </ProtectedRoute>
          )}
        />
        {/* Course Display Routes */}
        <Route
          path="/course/:courseId/*"
          element={
            <ProtectedRoute>
              <CourseLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<Navigate to="/course/1/module/intro-qubits" replace />} />
      </Routes>
    </Router>
  );
};

const CourseLayout: React.FC = () => {
  const { courseId, "*": modulePath } = useParams<{ courseId: string; "*": string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<FrontendModule[]>([]);
  const [currentCourse, setCurrentCourse] = useState<ApiCourse | null>(null);
  const [currentModuleExternalId, setCurrentModuleExternalId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiSectionToModule = useCallback((section: ApiCourseSection, allUnits: ApiLearningUnit[]): FrontendModule => {
    // Find units belonging to this section using section.id (DB primary key) and unit.section_id
    const sectionUnits = allUnits.filter(unit => unit.section_id === section.id);

    return {
      id: section.external_id,
      title: section.title,
      storyIntro: section.story_intro || '',
      icon: section.icon_ref ? getIconByName(section.icon_ref) : getIconByName('DefaultIcon'), // Use getIconByName
      concepts: sectionUnits
        .sort((a, b) => (a.unit_order ?? 0) - (b.unit_order ?? 0))
        .map((unit): FrontendConcept => ({
          id: unit.external_id,
          title: unit.title,
          explanation: unit.explanation || '',
          type: unit.unit_type as QCTEnum,
          data: unit.unit_data ? JSON.parse(unit.unit_data) : {},
        })),
      summary: section.summary || '',
    };
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Corrected: Use api.get for fetching course details
        const courseDetailsResponse = await api.get<ApiCourse>(`/api/courses/${courseId}`);
        setCurrentCourse(courseDetailsResponse.data);

        // Corrected: Use api.get for fetching course sections
        const sectionsResponse = await api.get<ApiCourseSection[]>(`/api/courses/${courseId}/sections`);
        const sectionsData = sectionsResponse.data;

        // Corrected: Use api.get for fetching all learning units for the course
        const learningUnitsResponse = await api.get<ApiLearningUnit[]>(`/api/courses/${courseId}/units`); 
        const allLearningUnitsForCourse = learningUnitsResponse.data;

        const frontendModules = sectionsData
          .sort((a,b) => (a.section_order ?? 0) - (b.section_order ?? 0))
          .map(section => transformApiSectionToModule(section, allLearningUnitsForCourse));
        
        setModules(frontendModules);

        if (modulePath && modulePath.startsWith('module/')) {
          setCurrentModuleExternalId(modulePath.split('/')[1]);
        } else if (frontendModules.length > 0) {
          // Default to the first module if no specific module is in the path
          navigate(`/course/${courseId}/module/${frontendModules[0].id}`, { replace: true });
          setCurrentModuleExternalId(frontendModules[0].id);
        }

      } catch (err: any) {
        console.error('Error fetching course layout data:', err);
        // Adjust error message to use err.data or err.message from the api utility
        setError(err.data?.error || err.message || 'An unknown error occurred while fetching course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, modulePath, navigate, transformApiSectionToModule]);
  
  // Effect to update currentModuleExternalId when modulePath changes from navigation
  useEffect(() => {
    if (modulePath && modulePath.startsWith('module/')) {
      const pathModuleId = modulePath.split('/')[1];
      if (pathModuleId !== currentModuleExternalId) {
        setCurrentModuleExternalId(pathModuleId);
      }
    }
  }, [modulePath, currentModuleExternalId]);


  const handleSelectModule = (moduleId: string) => {
    if (courseId) {
      navigate(`/course/${courseId}/module/${moduleId}`);
    }
  };

  const currentModule = modules.find(m => m.id === currentModuleExternalId);

  const handleNextModule = () => {
    if (!currentModule) return;
    const currentIndex = modules.findIndex(m => m.id === currentModule.id);
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      navigate(`/course/${courseId}/module/${nextModule.id}`);
    }
  };

  const handlePrevModule = () => {
    if (!currentModule) return;
    const currentIndex = modules.findIndex(m => m.id === currentModule.id);
    if (currentIndex > 0) {
      const prevModule = modules[currentIndex - 1];
      navigate(`/course/${courseId}/module/${prevModule.id}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-white">Loading course content...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-white">Error: {error}</div>;
  }

  if (!currentModule) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-quantum-void text-white overflow-hidden">
        <Sidebar 
          modules={modules} 
          courseTitle={currentCourse?.title || 'Course'} 
          currentModuleId={currentModuleExternalId} 
          onSelectModule={handleSelectModule}
        />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-quantum-glow mb-4">
              {modules.length > 0 ? 'Select a module to begin' : 'Loading module content or no concepts available...'}
            </h2>
            <p className="text-quantum-text-secondary">Please select a module from the sidebar or check the URL.</p>
            {courseId && !modulePath && modules.length > 0 && (
                <button 
                    onClick={() => navigate(`/course/${courseId}/module/${modules[0].id}`)} 
                    className="mt-4 px-4 py-2 bg-quantum-particle text-white rounded hover:bg-sky-500 transition-colors"
                >
                    Go to First Module
                </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-quantum-void text-white overflow-hidden">
      <Sidebar 
        modules={modules} 
        courseTitle={currentCourse?.title || 'Course'} 
        currentModuleId={currentModule.id} 
        onSelectModule={handleSelectModule}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <ModuleContent
          module={currentModule} // This is FrontendModule, which has icon as React.ReactNode
          onNextModule={handleNextModule}
          onPrevModule={handlePrevModule}
          isFirstModule={modules.findIndex(m => m.id === currentModule.id) === 0}
          isLastModule={modules.findIndex(m => m.id === currentModule.id) === modules.length - 1}
        />
      </main>
    </div>
  );
};

export default App;
