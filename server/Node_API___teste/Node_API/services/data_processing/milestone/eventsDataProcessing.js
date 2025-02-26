/**
 * Filters and transforms the array of raw event objects to extract camera related events
 *
 * @param {Object} data - The array containing the raw events.
 * @returns {Array} An array of objects, each containing only `id` and `displayName` of the matching events.
 * @throws {Error} If the input is invalid or the array is not provided.
 */
function filterCameraEvents(data) {
    if (!data || !Array.isArray(data)) {
        throw new Error("Invalid input: data.array must be an array");
    }

    return data
        .filter(item => Array.isArray(item.sourceArray) && item.sourceArray.includes("Camera"))
        .map(({ id, displayName }) => ({ id, displayName }));
}


module.exports = { filterCameraEvents };