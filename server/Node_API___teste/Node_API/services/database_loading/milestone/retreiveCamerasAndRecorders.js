const { getCamerasBaseInfos, processStreamDetails } = require('../../data_processing/milestone/camerasDataProcessing');
const { fetchCameraStates,fetchCameraConfiguration } = require('../../data_retreival/milestone/camerasDataRetreival');
const { getRecorders } = require('../../data_processing/milestone/recordersDataProcessing');
const { fetchRawDataFromManagementServer } = require('../../data_retreival/milestone/managementServerDataRetreival');



/**
 * Combines base camera information with detailed stream information and enabled states.
 *
 * @param {Array} recordersData - The `RecorderInfo` array from the SOAP response.
 * @param {string} domain - The domain for API endpoints.
 * @param {string} token - The authentication token for fetching camera states.
 * @returns {Promise<Array>} - An array of camera objects with all details.
 */
async function getCameras(recordersData, domain, username, password, token) {
    const baseCameras = getCamerasBaseInfos(recordersData);
    const processedCameras = [];

    try {
        // Fetch enabled states for all cameras
        const cameraStates = await fetchCameraStates(domain, token);

        // Map camera states for quick lookup
        const stateMap = new Map(
            cameraStates.map(state => [state.id, state.enabled])
        );

        for (const camera of baseCameras) {
            try {
                // Fetch the stream items for the camera
                const streamItems = await fetchCameraConfiguration(domain, username, password, camera.id);

                // Extract the default stream information (if available)
                const defaultStream = streamItems.find(item =>
                    item.Properties.Property.some(prop => prop.Key === 'StreamReferenceId')
                );

                if (defaultStream) {
                    const defaultStreamId = defaultStream.Properties.Property.find(
                        prop => prop.Key === 'StreamReferenceId'
                    )?.Value;

                    // Process detailed stream information
                    const detailedStreamInfo = processStreamDetails(streamItems, defaultStreamId);

                    // Combine base camera information with stream details and enabled state
                    processedCameras.push({
                        ...camera,
                        enabled: stateMap.get(camera.id) || false, // Default to false if not found
                        default_stream_name: defaultStream.DisplayName || null,
                        default_stream_id: defaultStreamId || null,
                        ...detailedStreamInfo,
                    });
                } else {
                    processedCameras.push({
                        ...camera,
                        enabled: stateMap.get(camera.id) || false, // Default to false if not found
                        default_stream_name: null,
                        default_stream_id: null,
                        codec: null,
                        resolution: null,
                        protocol: null,
                        fps: null,
                        controlMode: null,
                    });
                }
            } catch (error) {
                console.error(`Failed to process camera ${camera.name}:`, error);
                processedCameras.push({
                    ...camera,
                    enabled: stateMap.get(camera.id) || false, // Default to false if not found
                    default_stream_name: null,
                    default_stream_id: null,
                    codec: null,
                    resolution: null,
                    protocol: null,
                    fps: null,
                    controlMode: null,
                });
            }
        }
    } catch (error) {
        console.error('Failed to fetch camera states:', error);
    }

    return processedCameras;
}


/**
 * Fetches all cameras and recorders, then updates cameras with their enabled state.
 * 
 * @returns {Promise<{ recorders: Array, cameras: Array }>} - An object containing the recorders and cameras.
 */
async function getAllCamerasAndRecorders(domain, username, password, token) {
    try {
        // Fetch raw data from the management server
        const result = await fetchRawDataFromManagementServer(
            domain,
            'GetConfiguration',
            {}, // Arguments for the method
            username,
            password
        );

        // Process recorders
        const recordersData = result.GetConfigurationResult.Recorders.RecorderInfo;
        var Recorders = getRecorders(recordersData);

        // Process cameras for each recorder
        // Process all cameras at once
        var Cameras = await getCameras(recordersData, domain, username, password, token);

        // Update Cameras array with the enabled state from the REST API
        //const states = await fetchCameraStates(domain, token);
        //processCameraStates
        console.log({ Recorders, Cameras });
        return { Recorders, Cameras };
    } catch (error) {
        console.error('Error fetching cameras and recorders:', error);
        throw error;
    }
}

module.exports = {
    getAllCamerasAndRecorders
}