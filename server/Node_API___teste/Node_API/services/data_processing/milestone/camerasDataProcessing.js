/**
 * Updates the Cameras array with the "enabled" field based on the fetched camera states.
 *
 * @param {Array} cameraStates - An array of camera state objects with `id` and `enabled` fields.
 */
function processCameraStates(cameraStates) {
    if (!Array.isArray(cameraStates)) {
        throw new Error('Invalid input: cameraStates must be an array.');
    }

    cameraStates.forEach(({ id, enabled }) => {
        const matchingCamera = Cameras.find(camera => camera.id === id);
        if (matchingCamera) {
            matchingCamera.enabled = enabled;
        }
    });
}


/**
 * Extracts base information for cameras from the given recorders.
 *
 * @param {Array} recordersData - The `RecorderInfo` array from the SOAP response.
 * @returns {Array} - An array of camera objects with base fields.
 */
function getCamerasBaseInfos(recordersData) {
    if (!Array.isArray(recordersData)) {
        throw new Error('Invalid recorder data. Expected an array.');
    }

    const baseCameras = [];

    for (const recorder of recordersData) {
        if (!recorder.Cameras || !Array.isArray(recorder.Cameras.CameraInfo)) {
            continue; // Skip if no cameras are available for this recorder
        }

        for (const camera of recorder.Cameras.CameraInfo) {
            // Find and assign the URI using hardwareId
            const matchingRecorder = recordersData.find(rec =>
                rec.Hardware.HardwareInfo.some(hardware => hardware.HardwareId === camera.HardwareId)
            );

            let uri = null;
            if (matchingRecorder) {
                const matchingHardware = matchingRecorder.Hardware.HardwareInfo.find(
                    hardware => hardware.HardwareId === camera.HardwareId
                );
                uri = matchingHardware ? matchingHardware.Uri.replace(/^http:\/\//, '').replace(/\/$/, '') : null;
            }

            // Add base camera details
            baseCameras.push({
                id: camera.DeviceId,
                name: camera.Name,
                uri,
                recorder_id: camera.RecorderId,
                live: camera.CameraSecurity?.Live || false,
                ptz_enabled: camera.PtzSettings?.PtzEnabled || false,
                is_center_on_position_in_view_supported: camera.PtzSettings?.IsCenterOnPositionInViewSupported || false,
                is_ptz_diagonal_supported: camera.PtzSettings?.IsPtzDiagonalSupported || false,
                is_ptz_home_supported: camera.PtzSettings?.IsPtzHomeSupported || false,
            });
        }
    }

    return baseCameras;
}

/**
 * Fetches the configuration details of a specific camera.
 * 
 * @param {string} domain - The domain for the API endpoint.
 * @param {string} cameraGuid - The GUID of the camera to fetch details for.
 * @returns {Promise<Array>} - A promise that resolves to an array of stream configuration items.
 * @throws {Error} - If the configuration could not be retrieved.
 */
function processStreamDetails(streamItems, defaultStreamId) {
    // Find the stream that matches the defaultStreamId
    const matchedStream = streamItems.find(streamItem => {
        const properties = streamItem.Properties.Property || [];
        const streamReference = properties.find(property => property.Key === 'StreamReferenceId');
        return streamReference && streamReference.Value.toLowerCase() === defaultStreamId.toLowerCase();
    });

    if (!matchedStream) {
        console.warn(`No stream found with StreamReferenceId ${defaultStreamId}`);
        return {
            codec: null,
            resolution: null,
            protocol: null,
            fps: null,
            control_mode: null,
        };
    }

    // Process and extract the required properties
    const cameraDetails = matchedStream.Properties.Property;

    // Define a list of display names we're interested in
    const requiredDisplayNames = [
        'Codec',
        'Resolution',
        'Streaming Mode',
        'Frames per second',
        'Control mode'
    ];

    // Initialize an object to store the matched values
    const matchedValues = {
        codec: null,
        resolution: null,
        protocol: null,
        fps: null,
        control_mode: null,
    };

    // Loop through the camera details to match the display names
    cameraDetails.forEach(property => {
        if (requiredDisplayNames.includes(property.DisplayName)) {
            switch (property.DisplayName) {
                case 'Codec':
                    matchedValues['codec'] = property.Value || null;
                    break;
                case 'Resolution':
                    matchedValues['resolution'] = property.Value || null;
                    break;
                case 'Streaming Mode':
                    matchedValues['protocol'] = property.Value || null;
                    break;
                case 'Frames per second':
                    matchedValues['fps'] = property.Value || null;
                    break;
                case 'Control mode':
                    matchedValues['control_mode'] = property.Value || null;
                    break;
                default:
                    break;
            }
        }
    });

    return matchedValues;
}

module.exports = { processCameraStates, getCamerasBaseInfos, processStreamDetails };
