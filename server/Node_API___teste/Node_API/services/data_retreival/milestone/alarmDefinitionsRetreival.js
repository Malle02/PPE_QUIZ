const { makeHttpRequest } = require('../../../util/httpHandler');
/**
 * Fetches alarm definitions from the specified Milestone domain using the provided token.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @returns {Promise<Array>} - A promise that resolves with the alarm definitions array.
 */
async function getAlarmDefinitions(domain, token) {
    const url = `http://${domain}/API/rest/v1/alarmDefinitions?disabled=false`;
    const method = 'GET';
    const headers = {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
    };

    try {
        const response = await makeHttpRequest(url, method, headers);

        // Check for HTTP errors
        if (response.error) {
            throw new Error(`Failed to fetch alarm definitions. HTTP Status: ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        // Validate the response structure
        if (!Array.isArray(response.data.array)) {
            throw new Error('Invalid response structure. Expected an array.');
        }

        return response.data.array; // Return the alarm definitions array
    } catch (error) {
        console.error('Error fetching alarm definitions:', error.message);
        throw new Error('Could not retrieve alarm definitions.');
    }
}

module.exports = { getAlarmDefinitions };