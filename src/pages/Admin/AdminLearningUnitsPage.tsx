import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { ApiLearningUnit } from '../../types'; // Corrected path, removed LearningUnitData
import { api } from '../../utils/api'; // Corrected path

interface AdminLearningUnitsPageParams extends Record<string, string | undefined> {
  courseId: string;
  sectionId: string;
}

export const AdminLearningUnitsPage: React.FC = () => {
  const { courseId, sectionId } = useParams<AdminLearningUnitsPageParams>();
  const navigate = useNavigate();

  const [learningUnits, setLearningUnits] = useState<ApiLearningUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Unit State
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitType, setNewUnitType] = useState('TEXT');
  const [newUnitData, setNewUnitData] = useState<string>('{}'); // JSON string
  const [newUnitOrder, setNewUnitOrder] = useState<number>(0);

  // Editing Unit State
  const [editingUnit, setEditingUnit] = useState<ApiLearningUnit | null>(null);
  const [editUnitTitle, setEditUnitTitle] = useState('');
  const [editUnitType, setEditUnitType] = useState('TEXT');
  const [editUnitData, setEditUnitData] = useState<string>('{}'); // JSON string
  const [editUnitOrder, setEditUnitOrder] = useState<number>(0);


  const fetchLearningUnits = useCallback(async () => {
    if (!sectionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ units: ApiLearningUnit[] }>(`/api/courses/sections/${sectionId}/units`);
      if (response && response.data && Array.isArray(response.data.units)) {
        setLearningUnits(response.data.units.sort((a, b) => a.unit_order - b.unit_order));
        if (response.data.units.length > 0) {
          setNewUnitOrder(Math.max(...response.data.units.map(u => u.unit_order)) + 1);
        } else {
          setNewUnitOrder(1);
        }
      } else {
        setLearningUnits([]);
        setError("Received unexpected data format for learning units.");
      }
    } catch (err: any) {
      console.error("Error fetching learning units:", err);
      setError(err.response?.data?.error || "Failed to fetch learning units.");
    } finally {
      setIsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchLearningUnits();
  }, [fetchLearningUnits]);

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !sectionId) {
      alert("Unit title is required.");
      return;
    }
    if (!isValidJson(newUnitData)) {
      alert("Unit Data is not valid JSON.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const unitPayload = {
        title: newUnitTitle,
        unit_type: newUnitType,
        unit_data: JSON.parse(newUnitData),
        unit_order: newUnitOrder,
        section_id: parseInt(sectionId)
      };
      await api.post<ApiLearningUnit>(`/api/courses/sections/${sectionId}/units`, unitPayload);
      fetchLearningUnits(); // Refresh list
      setNewUnitTitle('');
      setNewUnitType('TEXT');
      setNewUnitData('{}');
      // setNewUnitOrder will be updated by fetchLearningUnits effect
    } catch (err: any) {
      console.error("Error creating learning unit:", err);
      setError(err.response?.data?.error || "Failed to create learning unit.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!sectionId || !window.confirm("Are you sure you want to delete this learning unit?")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/courses/sections/${sectionId}/units/${unitId}`);
      fetchLearningUnits(); // Refresh list
    } catch (err: any) {
      console.error("Error deleting learning unit:", err);
      setError(err.response?.data?.error || "Failed to delete learning unit.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (unit: ApiLearningUnit) => {
    setEditingUnit(unit);
    setEditUnitTitle(unit.title);
    setEditUnitType(unit.unit_type);
    setEditUnitData(JSON.stringify(unit.unit_data || {}, null, 2));
    setEditUnitOrder(unit.unit_order);
  };

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !sectionId) return;

    if (!isValidJson(editUnitData)) {
      alert("Unit Data is not valid JSON.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedPayload = {
        title: editUnitTitle,
        unit_type: editUnitType,
        unit_data: JSON.parse(editUnitData),
        unit_order: editUnitOrder,
      };
      await api.put<ApiLearningUnit>(`/api/courses/sections/${sectionId}/units/${editingUnit.id}`, updatedPayload);
      setEditingUnit(null);
      fetchLearningUnits(); // Refresh list
    } catch (err: any) {
      console.error("Error updating learning unit:", err);
      setError(err.response?.data?.error || "Failed to update learning unit.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // TODO: Define unit types based on your application's needs
  const availableUnitTypes = ["TEXT", "VIDEO", "QUIZ", "INTERACTIVE_SIM", "CODE_CHALLENGE", "EXTERNAL_RESOURCE", "CUSTOM_COMPONENT"];


  return (
    <div className="p-6 bg-slate-800 min-h-screen text-quantum-text-primary">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-quantum-particle mb-2">Manage Learning Units</h1>
        <p className="text-quantum-text-secondary">
          For Course ID: {courseId}, Section ID: {sectionId}. 
          <Link to={`/admin/course/${courseId}/sections`} className="ml-2 text-quantum-link hover:underline">Back to Sections</Link>
        </p>
      </header>

      {/* Create New Unit Form */}
      <section className="mb-10 p-6 bg-slate-700 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-quantum-glow mb-4">Create New Learning Unit</h2>
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <div>
            <label htmlFor="unitTitle" className="block text-sm font-medium text-quantum-text-secondary mb-1">Title</label>
            <input
              type="text"
              id="unitTitle"
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
              required
            />
          </div>
          <div>
            <label htmlFor="unitOrder" className="block text-sm font-medium text-quantum-text-secondary mb-1">Order</label>
            <input
              type="number"
              id="unitOrder"
              value={newUnitOrder}
              onChange={(e) => setNewUnitOrder(parseInt(e.target.value, 10))}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
              required
            />
          </div>
          <div>
            <label htmlFor="unitType" className="block text-sm font-medium text-quantum-text-secondary mb-1">Unit Type</label>
            <select
              id="unitType"
              value={newUnitType}
              onChange={(e) => setNewUnitType(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
            >
              {availableUnitTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="unitData" className="block text-sm font-medium text-quantum-text-secondary mb-1">Unit Data (JSON)</label>
            <textarea
              id="unitData"
              value={newUnitData}
              onChange={(e) => setNewUnitData(e.target.value)}
              rows={5}
              className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 font-mono text-sm focus:ring-quantum-glow focus:border-quantum-glow"
              placeholder={`{
  "text": "Your content here",
  "componentName": "OptionalComponentName"
}`}
            />
             <p className="text-xs text-slate-400 mt-1">Enter valid JSON. For CUSTOM_COMPONENT, ensure 'componentName' is specified.</p>
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-quantum-particle hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Unit'}
          </button>
        </form>
      </section>

      {/* Existing Units List */}
      <section>
        <h2 className="text-2xl font-semibold text-quantum-glow mb-6">Existing Learning Units</h2>
        {isLoading && learningUnits.length === 0 && <p className="text-quantum-text-secondary">Loading units...</p>}
        {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
        {!isLoading && !error && learningUnits.length === 0 && <p className="text-quantum-text-secondary">No learning units found for this section. Create one above!</p>}
        
        {learningUnits.length > 0 && (
          <ul className="space-y-4">
            {learningUnits.map(unit => (
              <li key={unit.id} className="p-4 bg-slate-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-quantum-particle">({unit.unit_order}) {unit.title}</h3>
                    <p className="text-sm text-quantum-text-secondary mb-1">Type: {unit.unit_type}</p>
                    <pre className="text-xs bg-slate-650 p-2 rounded-md overflow-x-auto text-slate-300 my-2">{JSON.stringify(unit.unit_data, null, 2)}</pre>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => openEditModal(unit)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUnit(unit.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-700 p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-quantum-glow mb-6">Edit Learning Unit (ID: {editingUnit.id})</h2>
            <form onSubmit={handleUpdateUnit} className="space-y-4">
              <div>
                <label htmlFor="editUnitTitle" className="block text-sm font-medium text-quantum-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  id="editUnitTitle"
                  value={editUnitTitle}
                  onChange={(e) => setEditUnitTitle(e.target.value)}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                  required
                />
              </div>
              <div>
                <label htmlFor="editUnitOrder" className="block text-sm font-medium text-quantum-text-secondary mb-1">Order</label>
                <input
                  type="number"
                  id="editUnitOrder"
                  value={editUnitOrder}
                  onChange={(e) => setEditUnitOrder(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                  required
                />
              </div>
              <div>
                <label htmlFor="editUnitType" className="block text-sm font-medium text-quantum-text-secondary mb-1">Unit Type</label>
                <select
                  id="editUnitType"
                  value={editUnitType}
                  onChange={(e) => setEditUnitType(e.target.value)}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:ring-quantum-glow focus:border-quantum-glow"
                >
                  {availableUnitTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="editUnitData" className="block text-sm font-medium text-quantum-text-secondary mb-1">Unit Data (JSON)</label>
                <textarea
                  id="editUnitData"
                  value={editUnitData}
                  onChange={(e) => setEditUnitData(e.target.value)}
                  rows={8}
                  className="w-full p-2 rounded-md bg-slate-600 text-white border border-slate-500 font-mono text-sm focus:ring-quantum-glow focus:border-quantum-glow"
                />
                <p className="text-xs text-slate-400 mt-1">Enter valid JSON. For CUSTOM_COMPONENT, ensure 'componentName' is specified.</p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingUnit(null)}
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
