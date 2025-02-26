const { makeHttpRequest } = require('../../../util/httpHandler');

/**
 * Fetches the latest alarms from the specified Milestone domain using the provided token.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @param {string} [time] - Optional timestamp to filter alarms (timestampz format).
 * @returns {Promise<Array>} - A promise that resolves with the array of latest alarms.
 */
async function getLatestAlarms(domain, token, time = null) {
    // Construct the base URL
    let url = `http://${domain}/API/rest/v1/alarms?orderBy=desc:'time'&state.name=notEquals:'Closed'`;

    // Include the timestamp filter if provided
    if (time) {
        url += `&time=gt:'${time}'`;
    }


    const method = 'GET';
    const headers = {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
    };

    try {
        // Make the HTTP request
        const response = await makeHttpRequest(url, method, headers);

        // Check for HTTP errors
        if (response.error) {
            throw new Error(`Failed to fetch alarms. HTTP Status: ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        // Validate the response structure
        if (!Array.isArray(response.data.array)) {
            throw new Error('Invalid response structure. Expected an array.');
        }

        return response.data.array; // Return the array of latest alarms
    } catch (error) {
        console.error('Error fetching latest alarms:', error.message);
        throw new Error('Could not retrieve latest alarms.');
    }
}

module.exports = { getLatestAlarms };
