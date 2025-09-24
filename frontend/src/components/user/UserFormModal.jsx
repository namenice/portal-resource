// src/components/user/UserFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, X } from 'lucide-react';

export default function UserFormModal({ isOpen, onClose, onSubmit, userToEdit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setUsername(userToEdit.username || '');
        setPassword('');
        setConfirmPassword('');
      } else {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
      setErrors({});
    }
  }, [userToEdit, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ปรับปรุง logic ของ isFormValid ให้เข้มงวดขึ้นในโหมด Edit
  const isFormValid = useCallback(() => {
    const hasUsername = username.trim() !== '';
    const hasPassword = password.trim() !== '';
    const passwordsMatch = password === confirmPassword;
    const passwordsAreValid = password.trim().length >= 6;

    // เงื่อนไขใหม่: ไม่ว่าจะเป็น Add หรือ Edit ต้องกรอกครบทุกช่อง
    return hasUsername && hasPassword && passwordsMatch && passwordsAreValid;
  }, [username, password, confirmPassword]);


  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!isFormValid()) {
      // เรียกใช้งาน validate เพื่อแสดงข้อความ error ในแต่ละช่อง
      validate();
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const userData = { username: username.trim() };
      if (password.trim()) {
        userData.password = password.trim();
      }

      await onSubmit({
        ...(userToEdit ? { id: userToEdit.id } : {}),
        ...userData
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prevErrors => ({ ...prevErrors, api: error.message }));
    } finally {
      setIsLoading(false);
    }
  }, [username, password, confirmPassword, onSubmit, onClose, userToEdit, isFormValid, validate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSubmit, onClose]);

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
                  {userToEdit ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm">
                  {userToEdit ? 'Update user information' : 'Create a new user account'}
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
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.username ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                    placeholder="Enter a username"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <User className={`h-5 w-5 transition-colors duration-200 ${errors.username ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                </div>
                {errors.username && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.username}</p>
                  </div>
                )}
              </div>
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.password ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-200 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.password}</p>
                  </div>
                )}
              </div>
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'} placeholder-gray-400`}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-200 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{errors.confirmPassword}</p>
                  </div>
                )}
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
                disabled={isLoading || !isFormValid()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {userToEdit ? (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span>Save Changes</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Add User</span>
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