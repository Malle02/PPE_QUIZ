const { makeHttpRequest } = require('../../../util/httpHandler');

/**
 * Updates an alarm with the specified data.
 *
 * @param {string} id - The ID of the alarm to be updated.
 * @param {string} input_comment - The comment for the alarm.
 * @param {string} input_priority_uuid - The UUID of the alarm priority.
 * @param {string} input_state_uuid - The UUID of the alarm state.
 * @returns {Promise<Object>} - A promise that resolves with the updated alarm data.
 */
async function updateAlarmRequest(domain,token,id, input_comment, input_priority_uuid, input_state_uuid) {
    const url = `http://${domain}/API/rest/v1/alarms/${id}`;
    
    const method = 'PATCH';
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    const body = {
        comment: input_comment,
        priority: input_priority_uuid,
        state: input_state_uuid,
        'assignedTo.displayName': "zedd",
        reasonForClosing: null // Always null as per your request
    };

    try {
        // Make the HTTP request using your utility function
        const response = await makeHttpRequest(url, method, headers, body);

        // Check for HTTP errors
        if (response.error) {
            throw new Error(`Failed to update alarm. HTTP Status: ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200 && response.status !== 202) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
        

        // Return the updated alarm data (milestone wraps it in data so extracting it right from here)
        return response.data.data; 
    } catch (error) {
        console.error(`Error updating alarm ${id}:`, error.message);
        throw new Error(`Failed to update alarm ${id}`);
    }
}

module.exports = { updateAlarmRequest };
