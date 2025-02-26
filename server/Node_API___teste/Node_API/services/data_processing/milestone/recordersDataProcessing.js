/**
 * Processes the recorders information for storage.
 *
 * @param {Array} recordersData - An array of recorder objects to process.
 * @returns {Array} An array of simplified recorder objects, each containing `guid`, `uri`, `hostName`, and `name`.
 * @throws {Error} If the input is not an array.
 *
 */
function getRecorders(recordersData) {
    if (!Array.isArray(recordersData)) {
        throw new Error('Invalid recorders data. Expected an array.');
    }

    // Map the recorders to extract the desired fields
    return recordersData.map(recorder => ({
        id: recorder.RecorderId,
        uri: recorder.WebServerUri,
        host_name: recorder.HostName,
        name: recorder.Name,
    }));
}

module.exports = { getRecorders };