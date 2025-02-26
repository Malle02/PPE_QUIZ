const { makeHttpRequest } = require('../../../util/httpHandler');

/**
 * Fetches all event types from the specified Milestone domain using the provided token.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @returns {Promise<Array>} - A promise that resolves with the event types array.
 */
async function getEventTypes(domain, token) {
    return fetchEvents(domain, token, '/API/rest/v1/eventTypes');
}

/**
 * Fetches user-defined event types from the specified Milestone domain using the provided token.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @returns {Promise<Array>} - A promise that resolves with the user-defined event types array.
 */
async function getUserDefinedEvents(domain, token) {
    return fetchEvents(domain, token, '/API/rest/v1/userDefinedEvents');
}

/**
 * Helper function to fetch events from the specified Milestone domain.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @param {string} endpoint - The API endpoint to fetch events from.
 * @returns {Promise<Array>} - A promise that resolves with the events array.
 */
async function fetchEvents(domain, token, endpoint) {
    const url = `http://${domain}${endpoint}`;
    const method = 'GET';
    const headers = {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
    };

    try {
        const response = await makeHttpRequest(url, method, headers);

        // Check for HTTP errors
        if (response.error) {
            throw new Error(`Failed to fetch events from ${endpoint}. HTTP Status: ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unexpected response status from ${endpoint}: ${response.status}`);
        }

        // Validate the response structure
        if (!Array.isArray(response.data.array)) {
            throw new Error(`Invalid response structure from ${endpoint}. Expected an array.`);
        }

        return response.data.array; // Return the events array
    } catch (error) {
        console.error(`Error fetching events from ${endpoint}:`, error.message);
        throw new Error(`Could not retrieve events from ${endpoint}.`);
    }
}

module.exports = { getEventTypes, getUserDefinedEvents };
