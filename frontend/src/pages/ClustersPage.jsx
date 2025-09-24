// src/pages/ClustersPage.jsx

import React, { useState, useEffect } from 'react';
import ClusterTable from '../components/cluster/ClusterTable.jsx';
import ClusterFormModal from '../components/cluster/ClusterFormModal.jsx';
import ClusterDeleteModal from '../components/cluster/ClusterDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function ClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentCluster, setCurrentCluster] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState(null);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('clusters');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setClusters(responseData.data);
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
    setCurrentCluster(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (cluster) => {
    // Create a new object with flattened project data for the modal
    setCurrentCluster({
      ...cluster,
      project_id: cluster.project.id,
      project_name: cluster.project.project_name,
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (cluster) => {
    setClusterToDelete(cluster);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clusterToDelete) return;
    try {
      const response = await authenticatedFetch(`clusters/${clusterToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete cluster. Status: ${response.status}`);
      await fetchClusters();
      setIsDeleteModalOpen(false);
      setClusterToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (clusterData) => {
    try {
      // API expects project_id, not a nested object
      const dataToSend = {
        ...clusterData,
        project_id: clusterData.project_id
      };
      
      if (currentCluster) {
        // Edit mode
        const response = await authenticatedFetch(`clusters/${currentCluster.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
        if (!response.ok) throw new Error('Failed to update cluster.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('clusters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
        if (!response.ok) throw new Error('Failed to create new cluster.');
      }
      await fetchClusters();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading clusters...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clusters</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cluster
          </button>
        </div>
      </div>

      <ClusterTable
        clusters={clusters}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <ClusterFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          clusterToEdit={currentCluster}
        />
      )}
      
      {isDeleteModalOpen && (
        <ClusterDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          clusterName={clusterToDelete?.name}
        />
      )}
    </div>
  );
}