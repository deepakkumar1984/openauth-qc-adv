import React, { useState, useEffect } from 'react';
import type { Course } from '../../types';
import { api } from '../../utils/api';
import { Link } from 'react-router-dom'; // Import Link

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editing modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState('');

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('Beginner');

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ courses: Course[] }>('/api/courses');
      if (response && response.data && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else {
        console.error("Fetched data is not in the expected format:", response);
        setCourses([]);
        setError("Received unexpected data format from server.");
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.error || "Failed to fetch courses. Please ensure the backend is running and API endpoints are set up.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      alert("Course title is required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newCourseData = { 
        title: newCourseTitle, 
        description: newCourseDescription, 
        level: newCourseLevel 
      };
      const response = await api.post<Course>('/api/courses', newCourseData);
      setCourses(prevCourses => [...prevCourses, response.data]);
      setNewCourseTitle('');
      setNewCourseDescription('');
      setNewCourseLevel('Beginner');
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(err.response?.data?.error || "Failed to create course. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/courses/${courseId}`);
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    } catch (err: any) {
      console.error("Error deleting course:", err);
      setError(err.response?.data?.error || "Failed to delete course. It might have associated sections or units.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditCourseTitle(course.title);
    setEditCourseDescription(course.description || '');
    setEditCourseLevel(course.level || 'Beginner');
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsLoading(true);
    setError(null);
    try {
      const updatedData = {
        title: editCourseTitle,
        description: editCourseDescription,
        level: editCourseLevel,
      };
      const response = await api.put<Course>(`/api/courses/${editingCourse.id}`, updatedData);
      setCourses(prevCourses => prevCourses.map(c => c.id === editingCourse.id ? response.data : c));
      setEditingCourse(null); 
    } catch (err: any) {
      console.error("Error updating course:", err);
      setError(err.response?.data?.error || "Failed to update course.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 min-h-screen text-quantum-text-primary">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-quantum-particle mb-2">Manage Courses</h1>
        <p className="text-quantum-text-secondary">Create, view, and edit courses.</p>
      </header>

      <section className="mb-10 p-6 bg-slate-700 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-quantum-glow mb-4">Create New Course</h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label htmlFor="courseTitle" className="block text-sm font-medium text-quantum-text-secondary mb-1">Title</label>
            <input
              type="text"
              id="courseTitle"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
              required
            />
          </div>
          <div>
            <label htmlFor="courseDescription" className="block text-sm font-medium text-quantum-text-secondary mb-1">Description</label>
            <textarea
              id="courseDescription"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              rows={3}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
            />
          </div>
          <div>
            <label htmlFor="courseLevel" className="block text-sm font-medium text-quantum-text-secondary mb-1">Level</label>
            <select
              id="courseLevel"
              value={newCourseLevel}
              onChange={(e) => setNewCourseLevel(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-quantum-glow mb-6">Existing Courses</h2>
        {isLoading && courses.length === 0 && <p className="text-quantum-text-secondary">Loading courses...</p>}
        {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
        {!isLoading && courses.length === 0 && !error && <p className="text-quantum-text-secondary">No courses found. Create one above!</p>}
        
        {courses.length > 0 && (
          <ul className="space-y-4">
            {courses.map(course => (
              <li key={course.id} className="p-4 bg-slate-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-quantum-particle">{course.title}</h3>
                    <p className="text-sm text-quantum-text-secondary mb-1">Level: {course.level || 'N/A'}</p>
                    <p className="text-quantum-text-primary text-sm mb-2">{course.description || 'No description.'}</p>
                    <Link 
                      to={`/admin/course/${course.id}/sections`}
                      className="mr-2 px-3 py-1.5 bg-quantum-field hover:bg-teal-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200"
                    >
                      Manage Sections
                    </Link>
                    <button 
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* TODO: Add link to manage sections for this course */}
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-700 p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-quantum-glow mb-6">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label htmlFor="editCourseTitle" className="block text-sm font-medium text-quantum-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  id="editCourseTitle"
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                  required
                />
              </div>
              <div>
                <label htmlFor="editCourseDescription" className="block text-sm font-medium text-quantum-text-secondary mb-1">Description</label>
                <textarea
                  id="editCourseDescription"
                  value={editCourseDescription}
                  onChange={(e) => setEditCourseDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                />
              </div>
              <div>
                <label htmlFor="editCourseLevel" className="block text-sm font-medium text-quantum-text-secondary mb-1">Level</label>
                <select
                  id="editCourseLevel"
                  value={editCourseLevel}
                  onChange={(e) => setEditCourseLevel(e.target.value)}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
