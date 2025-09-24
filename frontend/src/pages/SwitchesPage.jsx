// src/pages/SwitchesPage.jsx
import React, { useState, useEffect } from 'react';
import SwitchTable from '../components/switch/SwtichTable.jsx';
import SwitchDeleteModal from '../components/switch/SwitchDeleteModal.jsx';
import SwitchFormModal from '../components/switch/SwtichFormModel.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function SwitchPage() {
    const [switches, setSwitches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [switchToDelete, setSwitchToDelete] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentSwitch, setCurrentSwitch] = useState(null);

    useEffect(() => {
        fetchSwitches();
    }, [searchTerm]);

    const fetchSwitches = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // ดึงข้อมูล Switches จาก API
            const response = await authenticatedFetch(`switches${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const responseData = await response.json();
            if (responseData && Array.isArray(responseData.data)) {
                setSwitches(responseData.data);
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
        setCurrentSwitch(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (sw) => {
        setCurrentSwitch(sw);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (sw) => {
        setSwitchToDelete(sw);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!switchToDelete) return;
        try {
            // ลบ Switch ผ่าน API
            const response = await authenticatedFetch(`switches/${switchToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Failed to delete switch. Status: ${response.status}`);
            await fetchSwitches(); // โหลดรายการใหม่
            setSwitchToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (e) {
            setError(e.message);
            setIsDeleteModalOpen(false);
        }
    };

    const handleFormSubmit = async (switchData) => {
        try {
            if (currentSwitch) {
                // โหมดแก้ไข
                const response = await authenticatedFetch(`switches/${currentSwitch.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(switchData)
                });
                if (!response.ok) throw new Error('Failed to update switch.');
            } else {
                // โหมดเพิ่มใหม่
                const response = await authenticatedFetch('switches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(switchData)
                });
                if (!response.ok) throw new Error('Failed to create new switch.');
            }
            await fetchSwitches(); // โหลดรายการใหม่
            setIsFormModalOpen(false);
        } catch (e) {
            setError(e.message);
        }
    };

    if (isLoading) {
        return <div className="p-6">กำลังโหลดข้อมูล Switch...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500 font-medium">เกิดข้อผิดพลาด: {error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Switches</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleAdd}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Switch
                    </button>
                </div>
            </div>

            <SwitchTable
                switches={switches}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            {isDeleteModalOpen && (
                <SwitchDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSwitchToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                />
            )}

            {isFormModalOpen && (
                <SwitchFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    switchToEdit={currentSwitch}
                />
            )}
        </div>
    );
}