// No imports needed - JSforce is available globally from CDN

// Using the proxy server to avoid CORS issues

// Base URL for the proxy server
const PROXY_BASE_URL = 'http://localhost:3001';

export const salesforceService = {
    /**
     * Login to Salesforce
     * @param {string} username - Salesforce username
     * @param {string} password - Salesforce password (with security token if needed)
     * @param {string} loginUrl - Salesforce login URL (default: https://login.salesforce.com)
     * @returns {Promise<Object>} - User info
     */
    async login(username, password, loginUrl = 'https://login.salesforce.com') {
        try {
            // Use the proxy server for authentication
            const response = await fetch(`${PROXY_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    loginUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }

            const authData = await response.json();

            // Store auth info in session storage (more secure than local storage)
            sessionStorage.setItem('sf_access_token', authData.accessToken);
            sessionStorage.setItem('sf_instance_url', authData.instanceUrl);
            sessionStorage.setItem('sf_user_id', authData.userId);

            return {
                id: authData.userId,
                organizationId: authData.organizationId
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Make an API request to Salesforce through the proxy
     * @param {string} path - API path
     * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
     * @param {object} data - Request body for POST/PATCH requests
     * @returns {Promise<Object>} - API response
     */
    async request(path, method = 'GET', data = null) {
        try {
            const accessToken = sessionStorage.getItem('sf_access_token');
            const instanceUrl = sessionStorage.getItem('sf_instance_url');

            if (!accessToken || !instanceUrl) {
                throw new Error('Not authenticated. Please log in first.');
            }

            const response = await fetch(`${PROXY_BASE_URL}/api/sf/${path}`, {
                method: 'POST', // Always POST to the proxy (actual method in body)
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken,
                    instanceUrl,
                    method,
                    data
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    /**
     * Logout from Salesforce
     */
    async logout() {
        try {
            // Clear stored credentials
            sessionStorage.removeItem('sf_access_token');
            sessionStorage.removeItem('sf_instance_url');
            sessionStorage.removeItem('sf_user_id');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!(
            sessionStorage.getItem('sf_access_token') &&
            sessionStorage.getItem('sf_instance_url')
        );
    }
};
