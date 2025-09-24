import React, { useState, useEffect } from 'react';
import UserTable from '../components/user/UserTable.jsx';
import UserFormModal from '../components/user/UserFormModal.jsx';
import UserDeleteModal from '../components/user/UserDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('users');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setUsers(responseData.data);
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
    setCurrentUser(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await authenticatedFetch(`users/${userToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete user. Status: ${response.status}`);
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (currentUser) {
        // Edit mode
        const response = await authenticatedFetch(`users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentUser.id,
            username: userData.username,
            password: userData.password,
          })
        });
        if (!response.ok) throw new Error('Failed to update user.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to create new user.');
      }
      await fetchUsers();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          userToEdit={currentUser}
        />
      )}
      
      {isDeleteModalOpen && (
        <UserDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          username={userToDelete?.username}
        />
      )}
    </div>
  );
}