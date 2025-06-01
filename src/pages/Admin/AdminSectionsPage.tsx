import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { CourseSection, Course } from '../../types';
import { api } from '../../utils/api';
import { getIconByName } from '../../utils/iconMap'; // Assuming you have this for icons

export const AdminSectionsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new/editing section
  const [isEditing, setIsEditing] = useState<CourseSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionExternalId, setSectionExternalId] = useState('');
  const [sectionIconRef, setSectionIconRef] = useState('');
  const [sectionStoryIntro, setSectionStoryIntro] = useState('');
  const [sectionSummary, setSectionSummary] = useState('');
  const [sectionOrder, setSectionOrder] = useState(0);

  const numericCourseId = parseInt(courseId || '');

  const fetchCourseDetails = useCallback(async () => {
    if (isNaN(numericCourseId)) {
      setError("Invalid course ID.");
      return;
    }
    setIsLoading(true);
    try {
      const courseDetails = await api.get<Course>(`/api/courses/${numericCourseId}`);
      setCourse(courseDetails.data);
    } catch (err: any) {
      console.error("Error fetching course details:", err);
      setError(err.response?.data?.error || "Failed to fetch course details.");
    } finally {
      setIsLoading(false);
    }
  }, [numericCourseId]);

  const fetchSections = useCallback(async () => {
    if (isNaN(numericCourseId)) {
      setError("Invalid course ID for fetching sections.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<CourseSection[]>(`/api/courses/${numericCourseId}/sections`);
      setSections(response.data.sort((a, b) => a.section_order - b.section_order));
    } catch (err: any) {
      console.error("Error fetching sections:", err);
      setError(err.response?.data?.error || "Failed to fetch sections.");
    } finally {
      setIsLoading(false);
    }
  }, [numericCourseId]);

  useEffect(() => {
    fetchCourseDetails();
    fetchSections();
  }, [fetchCourseDetails, fetchSections]);

  const resetForm = () => {
    setIsEditing(null);
    setSectionTitle('');
    setSectionExternalId('');
    setSectionIconRef('');
    setSectionStoryIntro('');
    setSectionSummary('');
    setSectionOrder(sections.length > 0 ? Math.max(...sections.map(s => s.section_order)) + 1 : 0);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numericCourseId)) {
      setError("Cannot submit form: Invalid course ID.");
      return;
    }
    if (!sectionTitle.trim() || !sectionExternalId.trim()) {
      alert("Section Title and External ID are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const sectionData = {
      title: sectionTitle,
      external_id: sectionExternalId,
      icon_ref: sectionIconRef,
      story_intro: sectionStoryIntro,
      summary: sectionSummary,
      section_order: Number(sectionOrder),
      course_id: numericCourseId, // Ensure course_id is part of the payload if needed by backend for creation
    };

    try {
      if (isEditing) {
        await api.put(`/api/courses/${numericCourseId}/sections/${isEditing.id}`, sectionData);
      } else {
        await api.post(`/api/courses/${numericCourseId}/sections`, sectionData);
      }
      fetchSections(); // Refresh list
      resetForm();
    } catch (err: any) {
      console.error("Error saving section:", err);
      setError(err.response?.data?.error || "Failed to save section.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: CourseSection) => {
    setIsEditing(section);
    setSectionTitle(section.title);
    setSectionExternalId(section.external_id);
    setSectionIconRef(section.icon_ref || '');
    setSectionStoryIntro(section.story_intro || '');
    setSectionSummary(section.summary || '');
    setSectionOrder(section.section_order);
  };

  const handleDelete = async (sectionId: number) => {
    if (isNaN(numericCourseId)) {
      setError("Cannot delete: Invalid course ID.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this section? This may also delete associated learning units if not handled by the backend.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/courses/${numericCourseId}/sections/${sectionId}`);
      fetchSections(); // Refresh list
    } catch (err: any) {
      console.error("Error deleting section:", err);
      setError(err.response?.data?.error || "Failed to delete section. It might have learning units.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { // Set initial sectionOrder for new sections
    if (!isEditing) {
      setSectionOrder(sections.length > 0 ? Math.max(...sections.map(s => s.section_order)) + 1 : 0);
    }
  }, [sections, isEditing]);


  if (isNaN(numericCourseId)) {
    return <div className="p-6 text-red-500">Invalid Course ID provided in URL.</div>;
  }

  return (
    <div className="p-6 bg-slate-800 min-h-screen text-quantum-text-primary">
      <header className="mb-8">
        <button onClick={() => navigate('/admin/courses')} className="text-quantum-link hover:underline mb-2">
          &larr; Back to Courses
        </button>
        <h1 className="text-3xl font-bold text-quantum-particle mb-1">
          Manage Sections for: {course ? course.title : 'Loading...'}
        </h1>
        {course && <p className="text-sm text-quantum-text-secondary">Course ID: {course.id}</p>}
      </header>

      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}

      <section className="mb-10 p-6 bg-slate-700 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-quantum-glow mb-4">{isEditing ? 'Edit Section' : 'Create New Section'}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sectionTitle" className="block text-sm font-medium text-quantum-text-secondary mb-1">Title</label>
              <input type="text" id="sectionTitle" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required className="w-full p-2 input-base" />
            </div>
            <div>
              <label htmlFor="sectionExternalId" className="block text-sm font-medium text-quantum-text-secondary mb-1">External ID</label>
              <input type="text" id="sectionExternalId" value={sectionExternalId} onChange={(e) => setSectionExternalId(e.target.value)} required className="w-full p-2 input-base" />
            </div>
            <div>
              <label htmlFor="sectionIconRef" className="block text-sm font-medium text-quantum-text-secondary mb-1">Icon Reference (e.g., 'RocketLaunch')</label>
              <input type="text" id="sectionIconRef" value={sectionIconRef} onChange={(e) => setSectionIconRef(e.target.value)} className="w-full p-2 input-base" />
            </div>
            <div>
              <label htmlFor="sectionOrder" className="block text-sm font-medium text-quantum-text-secondary mb-1">Order</label>
              <input type="number" id="sectionOrder" value={sectionOrder} onChange={(e) => setSectionOrder(parseInt(e.target.value))} required className="w-full p-2 input-base" />
            </div>
          </div>
          <div>
            <label htmlFor="sectionStoryIntro" className="block text-sm font-medium text-quantum-text-secondary mb-1">Story Intro (Markdown/HTML)</label>
            <textarea id="sectionStoryIntro" value={sectionStoryIntro} onChange={(e) => setSectionStoryIntro(e.target.value)} rows={3} className="w-full p-2 input-base" />
          </div>
          <div>
            <label htmlFor="sectionSummary" className="block text-sm font-medium text-quantum-text-secondary mb-1">Summary (Markdown/HTML)</label>
            <textarea id="sectionSummary" value={sectionSummary} onChange={(e) => setSectionSummary(e.target.value)} rows={3} className="w-full p-2 input-base" />
          </div>
          <div className="flex space-x-3">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Section')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-quantum-glow mb-6">Existing Sections</h2>
        {isLoading && sections.length === 0 && <p>Loading sections...</p>}
        {!isLoading && sections.length === 0 && !error && <p>No sections found for this course. Create one above!</p>}
        
        {sections.length > 0 && (
          <ul className="space-y-4">
            {sections.map(section => (
              <li key={section.id} className="p-4 bg-slate-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-quantum-particle flex items-center">
                      {getIconByName(section.icon_ref || 'Default')} 
                      <span className="ml-2">{section.title} (Order: {section.section_order})</span>
                    </h3>
                    <p className="text-xs text-quantum-text-dimmed">ID: {section.id} | Ext. ID: {section.external_id}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEdit(section)}
                      className="mr-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <Link 
                      to={`/admin/course/${courseId}/section/${section.id}/units`}
                      className="mr-2 px-3 py-1.5 bg-quantum-field hover:bg-teal-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200"
                    >
                      Manage Units
                    </Link>
                    <button 
                      onClick={() => handleDelete(section.id)} 
                      disabled={isLoading} 
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {section.story_intro && <details className="text-sm mb-1"><summary className="cursor-pointer text-quantum-link">View Story Intro</summary><div className="prose prose-sm prose-invert mt-1 p-2 bg-slate-650 rounded"><div dangerouslySetInnerHTML={{ __html: section.story_intro }} /></div></details>}
                {section.summary && <details className="text-sm"><summary className="cursor-pointer text-quantum-link">View Summary</summary><div className="prose prose-sm prose-invert mt-1 p-2 bg-slate-650 rounded"><div dangerouslySetInnerHTML={{ __html: section.summary }} /></div></details>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

// Add this to your global css or tailwind config if you want to use @apply for .input-base
// .input-base { @apply p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow; }
// Same for buttons:
// .btn-primary { @apply px-4 py-2 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50; }
// .btn-secondary { @apply px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200; }
// .btn-danger { @apply px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50; }
// .btn-sm { @apply px-2 py-1 text-xs; }
