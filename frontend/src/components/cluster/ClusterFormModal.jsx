// src/components/cluster/ClusterFormModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { GitFork, X, ChevronDown } from 'lucide-react';
import { authenticatedFetch } from '../../services/api.jsx';

export default function ClusterFormModal({ isOpen, onClose, onSubmit, clusterToEdit }) {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    try {
      // Fetch projects from the dedicated /projects endpoint
      const response = await authenticatedFetch('projects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result && Array.isArray(result.data)) {
        setProjects(result.data);
      } else {
        throw new Error('API response format for projects is incorrect.');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrors(prev => ({ ...prev, projects: 'Failed to load projects. Please try refreshing the page.' }));
    } finally {
      setIsProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (clusterToEdit) {
        setName(clusterToEdit.name || '');
        setDescription(clusterToEdit.description || '');
        // Correctly set the project ID from the clusterToEdit prop
        setProjectId(clusterToEdit.project_id.toString() || '');
      } else {
        setName('');
        setDescription('');
        setProjectId('');
      }
      setErrors({});
    }
  }, [clusterToEdit, isOpen, fetchProjects]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Cluster name is required.';
    }
    if (!projectId) {
      newErrors.projectName = 'Project is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProjectChange = (e) => {
    setProjectId(e.target.value);
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onSubmit({
          id: clusterToEdit?.id,
          name: name.trim(),
          project_id: Number(projectId),
          description: description.trim(),
        });
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors(prev => ({ ...prev, submit: 'Failed to save cluster. Please try again.' }));
      } finally {
        setIsLoading(false);
      }
    }
  }, [name, projectId, description, onSubmit, onClose, clusterToEdit, validate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out">
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {clusterToEdit ? 'Edit Cluster' : 'Add New Cluster'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm">
                  {clusterToEdit ? 'Update cluster information' : 'Create a new cluster'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.name ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                    placeholder="Enter cluster name (e.g., Web Cluster 01)"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.name}</p>
                  </div>
                )}
              </div>
              <div className="group">
                <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="projectName"
                    id="projectName"
                    value={projectId}
                    onChange={handleProjectChange}
                    className={`w-full px-4 py-3 appearance-none rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.projectName ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                    disabled={isLoading || isProjectsLoading}
                >
                  <option value="" disabled>
                    {isProjectsLoading ? 'Loading projects...' : 'Select a project'}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
                </div>
                {errors.projectName && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.projectName}</p>
                  </div>
                )}
              </div>
              <div className="group">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                  placeholder="Enter a brief description"
                  disabled={isLoading}
                ></textarea>
              </div>
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isProjectsLoading || !name.trim() || !projectId}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {clusterToEdit ? (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span>Save Changes</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Add Cluster</span>
                      </div>
                    )}
                </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}