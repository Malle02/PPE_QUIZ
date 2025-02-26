const { invokeSoapMethodWithAuth, formatOptionsForMilestone, ServiceType } = require("../../../util/soapHandler");
const { makeHttpRequest } = require("../../../util/httpHandler");

/**
 * Fetches the state of cameras from the specified Milestone domain.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} token - The access token for authentication.
 * @returns {Promise<Array>} - A promise that resolves with an array of camera states.
 * @throws {Error} If the request fails or the response is invalid.
 */
async function fetchCameraStates(domain, token) {
    const url = `http://${domain}/api/rest/v1/cameras`;
    const method = 'GET';
    const headers = {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
    };
    
    try {
        const response = await makeHttpRequest(url, method, headers);

        // Check for HTTP errors
        if (response.error) {
            throw new Error(`Failed to fetch cameras state. HTTP Status: ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        const cameraStates = response.data.array;

        // Validate the response structure
        if (!Array.isArray(cameraStates)) {
            throw new Error('Invalid response structure. Expected an array.');
        }

        return cameraStates;
    } catch (error) {
        console.error('Error fetching camera states:', error.message);
        throw new Error('Could not retrieve camera states.');
    }
}

/**
 * Fetches the raw configuration data for a camera from the Milestone system.
 *
 * @param {string} domain - The domain of the Milestone system.
 * @param {string} cameraGuid - The GUID of the camera.
 * @returns {Promise<Array>} - A promise that resolves with raw stream configuration items.
 * @throws {Error} If the SOAP request fails or the response is invalid.
 */
async function fetchCameraConfiguration(domain, username, password, cameraGuid) {
    const url = `https://${domain}/ManagementServer/${ServiceType.ConfigurationAPI}?wsdl`;
    const options = formatOptionsForMilestone(domain, ServiceType.ConfigurationAPI);
    const args = { path: `Camera[${cameraGuid}]/DeviceDriverSettingsFolder` };

    try {
        const result = await invokeSoapMethodWithAuth(url, options, 'GetChildItems', args, username, password, domain);

        // Navigate to ConfigurationItem and filter by ItemType 'Stream'
        const configurationItems = result.GetChildItemsResult.ConfigurationItem[0]?.Children?.ConfigurationItem || [];
        return configurationItems.filter(item => item.ItemType === 'Stream');
    } catch (error) {
        console.error(`Error fetching configuration for camera ${cameraGuid}:`, error);
        throw new Error('Could not retrieve camera configuration.');
    }
}


module.exports = { fetchCameraStates, fetchCameraConfiguration };