// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

/**
 * A general function to handle all authenticated API calls.
 * @param {string} endpoint The specific API endpoint (e.g., 'sites').
 * @param {object} options Fetch options like method, body, headers.
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // If no token exists, the request will fail.
    // The ProtectedRoute in App.jsx will handle the redirect.
    throw new Error('No authentication token found.');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}/${endpoint}`, config);

  // Check for expired token (401 Unauthorized)
  if (response.status === 401) {
    // This is a common pattern to handle expired tokens.
    // We'll implement a logout handler for this in the next step.
    localStorage.removeItem('authToken');
    window.location.href = '/login'; // Redirect to login
  }

  return response;
}