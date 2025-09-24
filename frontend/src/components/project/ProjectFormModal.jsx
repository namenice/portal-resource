import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, X } from 'lucide-react';

export default function ProjectFormModal({ isOpen, onClose, onSubmit, projectToEdit }) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setName(projectToEdit.name || '');
        setOwner(projectToEdit.owner || '');
        setDescription(projectToEdit.description || '');
      } else {
        setName('');
        setOwner('');
        setDescription('');
      }
      setErrors({});
    }
  }, [projectToEdit, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Project name is required.';
    }
    if (!owner.trim()) {
      newErrors.owner = 'Project owner is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onSubmit({
          id: projectToEdit?.id,
          name: name.trim(),
          owner: owner.trim(),
          description: description.trim(),
        });
        setName('');
        setOwner('');
        setDescription('');
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [name, owner, description, onSubmit, onClose, projectToEdit]);

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
                  {projectToEdit ? 'Edit Project' : 'Add New Project'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm">
                  {projectToEdit ? 'Update project information' : 'Create a new project'}
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
                    placeholder="Enter project name (e.g., Project Alpha)"
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
                <label htmlFor="owner" className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="owner"
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.owner ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                  placeholder="Enter project owner's name (e.g., Alice)"
                  disabled={isLoading}
                />
                {errors.owner && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.owner}</p>
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
                disabled={isLoading || !name.trim() || !owner.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {projectToEdit ? (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span>Save Changes</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Add Project</span>
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