import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ModuleContent } from './components/ModuleContent';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import type { Module as FrontendModule, ApiCourse, ApiCourseSection, ApiLearningUnit, QuantumConceptType as QCTEnum } from './types'; // Renamed Module to FrontendModule
import { fetchApi } from './utils/api';
import { getIconByName } from './utils/iconMap';

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
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/course/:courseId/*"
          element={
            <ProtectedRoute>
              <CourseLayout />
            </ProtectedRoute>
          }
        />
        {/* Fallback route: if no courseId is specified, or an invalid one, this could redirect to a course selection page or a default course */}
        {/* For now, redirecting to course 1, module 'intro-qubits' as a default landing after login */}
        <Route path="/*" element={<Navigate to="/course/1/module/intro-qubits" replace />} />
      </Routes>
    </Router>
  );
};

const CourseLayout: React.FC = () => {
  const { courseId, "*": modulePath } = useParams<{ courseId: string; "*": string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<FrontendModule[]>([]); // Use FrontendModule type
  const [currentCourse, setCurrentCourse] = useState<ApiCourse | null>(null);
  const [currentModuleExternalId, setCurrentModuleExternalId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [completedModules, setCompletedModules] = React.useState<Set<string>>(new Set()); // TODO: Integrate with UserProgress API

  const transformApiSectionToModule = useCallback((section: ApiCourseSection, units: ApiLearningUnit[]): FrontendModule => {
    return {
      id: section.external_id,
      title: section.title,
      storyIntro: section.story_intro || '',
      icon: section.icon_ref || '', // Pass icon ref string, will be converted to ReactNode before Sidebar/ModuleContent
      summary: section.summary || '',
      concepts: units.map(unit => ({
        id: unit.external_id,
        title: unit.title,
        explanation: unit.explanation, // Will be string (HTML)
        type: unit.unit_type as QCTEnum, // Cast string to enum
        data: unit.unit_data ? JSON.parse(unit.unit_data) : undefined,
      })),
    };
  }, []);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Attempt to fetch the specific course by its ID. 
        // This assumes your API has an endpoint like /api/courses/:id that returns a single course object.
        // If not, you might need to fetch all courses and then find the one with the matching courseId.
        // For now, we'll assume /api/courses returns all courses and we filter client-side, or use a specific endpoint if available.
        
        // Option 1: Fetch all courses and find the current one (if /api/courses/:id is not available)
        // const allCoursesRes = await fetchApi(`/api/courses`);
        // if (!allCoursesRes.ok) throw new Error('Failed to fetch courses list');
        // const allCoursesData: { courses: ApiCourse[] } = await allCoursesRes.json();
        // const targetCourse = allCoursesData.courses.find(c => c.id.toString() === courseId);
        // if (!targetCourse) throw new Error('Course not found');
        // setCurrentCourse(targetCourse);

        // Option 2: Assume an endpoint /api/courses/:courseId exists (more efficient)
        // This part is tricky if the API only gives a list. For now, let's simulate fetching course title later or assume it.
        // We will primarily focus on sections and units for a given courseId.
        // To get the course title, we might need another API call or adjust the /api/courses/:courseId/sections to include course title.
        // For simplicity, we'll set a placeholder title or fetch it if the API supports it.
        // Let's assume for now that we don't have a specific endpoint for a single course title and fetch all to find it.
        const allCoursesRes = await fetchApi(`/api/courses`);
        if (!allCoursesRes.ok) throw new Error('Failed to fetch courses list to find current course title');
        const allCoursesData: { courses: ApiCourse[] } = await allCoursesRes.json();
        const targetCourse = allCoursesData.courses.find(c => c.id.toString() === courseId);
        setCurrentCourse(targetCourse || null); // Set current course, or null if not found

        const sectionsRes = await fetchApi(`/api/courses/${courseId}/sections`);
        if (!sectionsRes.ok) throw new Error('Failed to fetch sections');
        const sectionsData: { sections: ApiCourseSection[] } = await sectionsRes.json();

        if (!sectionsData.sections || sectionsData.sections.length === 0) {
          setModules([]);
          // If no specific module in URL, and no sections, this state is handled by render logic
        } else {
            const fetchedModules: FrontendModule[] = [];
            for (const section of sectionsData.sections) {
              // Corrected API path for fetching units
              const unitsRes = await fetchApi(`/api/courses/sections/${section.id}/units`);
              if (!unitsRes.ok) throw new Error(`Failed to fetch units for section ${section.id} (${section.title})`);
              const unitsData: { units: ApiLearningUnit[] } = await unitsRes.json();
              fetchedModules.push(transformApiSectionToModule(section, unitsData.units || []));
            }
            setModules(fetchedModules);

            if (fetchedModules.length > 0) {
                const currentPathModuleId = modulePath?.startsWith('module/') ? modulePath.split('/')[1] : undefined;
                const targetModuleId = currentPathModuleId && fetchedModules.some(m => m.id === currentPathModuleId)
                                        ? currentPathModuleId
                                        : fetchedModules[0].id; // Default to first module if current path is invalid or not set
                
                if (targetModuleId !== currentPathModuleId) { // Avoid redundant navigation
                    navigate(`/course/${courseId}/module/${targetModuleId}`, { replace: true });
                }
                setCurrentModuleExternalId(targetModuleId);
            } else {
                // No modules/sections, clear current module ID
                setCurrentModuleExternalId(undefined);
            }
        }

      } catch (err: any) {
        console.error('Error loading course data:', err);
        setError(err.message || 'Failed to load course content.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, navigate, transformApiSectionToModule, modulePath]); // Added modulePath to dependencies

  // This effect is to ensure currentModuleExternalId is correctly set from the URL path if it changes.
  useEffect(() => {
    const currentPathId = modulePath?.startsWith('module/') ? modulePath.split('/')[1] : undefined;
    if (currentPathId && modules.some(m => m.id === currentPathId)) {
        setCurrentModuleExternalId(currentPathId);
    } else if (modules.length > 0 && !currentPathId) {
        // If path is base /course/:courseId/ and modules are loaded, set to first module
        setCurrentModuleExternalId(modules[0].id);
    }
    // If currentPathId is undefined or invalid, and modules exist, previous effect should have navigated.
    // If modules is empty, currentModuleExternalId will remain undefined.
  }, [modulePath, modules]);


  const handleSelectModule = (moduleId: string) => {
    // setCurrentModuleExternalId(moduleId); // This will be set by the navigation and subsequent useEffect
    navigate(`/course/${courseId}/module/${moduleId}`);
  };

  const currentModuleIndex = modules.findIndex(m => m.id === currentModuleExternalId);
  const currentModule = currentModuleIndex !== -1 ? modules[currentModuleIndex] : undefined;

  const handleNextModule = () => {
    if (currentModule && currentModuleIndex < modules.length - 1) {
      const nextModuleId = modules[currentModuleIndex + 1].id;
      handleSelectModule(nextModuleId);
      // setCompletedModules(prev => new Set(prev).add(currentModule.id)); // TODO: API call
    } else if (currentModule && currentModuleIndex === modules.length - 1) {
      // setCompletedModules(prev => new Set(prev).add(currentModule.id)); // TODO: API call
      console.log("All modules completed for this course!");
      // Potentially navigate to a course completion page or show a message
    }
  };

  const handlePrevModule = () => {
    if (currentModuleIndex > 0) {
      const prevModuleId = modules[currentModuleIndex - 1].id;
      handleSelectModule(prevModuleId);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-white">Loading course content...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-red-400">Error: {error} <button onClick={() => navigate('/', {replace: true})} className='underline ml-2'>Go Home</button></div>;
  }

  if (!isLoading && modules.length === 0 && !error) {
      return <div className="flex items-center justify-center h-screen bg-quantum-void text-white">No modules found for this course, or course not found. <button onClick={() => navigate('/', {replace: true})} className='underline ml-2'>Go Home</button></div>;
  }
  
  // If modules are loaded, but currentModuleExternalId is somehow not set or invalid, and not loading/erroring
  // This case should ideally be handled by navigation logic in useEffect to select a default module.
  // If currentModule is still undefined here, it might mean an issue with modulePath or module list.
  if (!currentModule && !isLoading && modules.length > 0 && currentModuleExternalId) {
    return <div className="flex items-center justify-center h-screen bg-quantum-void text-yellow-400">Module <code className='mx-1'>{currentModuleExternalId}</code> not found. <button onClick={() => navigate(`/course/${courseId}/module/${modules[0].id}`, {replace: true})} className='underline ml-2'>Go to first module</button></div>;
  }

  return (
    <div className="flex h-screen bg-quantum-void text-quantum-text-primary">
      <Sidebar
        modules={modules.map(m => ({ ...m, icon: getIconByName(m.icon) }))} 
        currentModuleId={currentModuleExternalId} 
        onSelectModule={handleSelectModule} // This prop name and signature now matches SidebarProps
        // completedModules={completedModules} // TODO: Integrate
        courseTitle={currentCourse?.title || 'Quantum Adventure'}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-800">
        {currentModule ? (
          <ModuleContent
            module={{...currentModule, icon: getIconByName(currentModule.icon) }}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
            isFirstModule={currentModuleIndex === 0}
            isLastModule={currentModuleIndex === modules.length - 1}
            isModuleCompleted={false} // Placeholder
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-quantum-text-secondary">
              {isLoading ? 'Loading module...' : (modules.length > 0 ? 'Select a module to continue your Quantum Adventure!' : 'No modules available.')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
