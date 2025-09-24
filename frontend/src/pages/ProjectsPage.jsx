import React, { useState, useEffect } from 'react';
import ProjectTable from '../components/project/ProjectTable.jsx';
import ProjectFormModal from '../components/project/ProjectFormModal.jsx';
import ProjectDeleteModal from '../components/project/ProjectDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('projects');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setProjects(responseData.data);
      } else {
        throw new Error('API response format is incorrect.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentProject(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (project) => {
    setCurrentProject(project);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      const response = await authenticatedFetch(`projects/${projectToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete project. Status: ${response.status}`);
      await fetchProjects();
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (projectData) => {
    try {
      if (currentProject) {
        // Edit mode
        const response = await authenticatedFetch(`projects/${currentProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Failed to update project.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Failed to create new project.');
      }
      await fetchProjects();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      <ProjectTable
        projects={projects}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <ProjectFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          projectToEdit={currentProject}
        />
      )}
      
      {isDeleteModalOpen && (
        <ProjectDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          projectName={projectToDelete?.name}
        />
      )}
    </div>
  );
}