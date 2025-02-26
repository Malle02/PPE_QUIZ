const { getEventTypes, getUserDefinedEvents } = require('../../data_retreival/milestone/eventsDataRetreival');
const { getAlarmDefinitions } = require('../../data_retreival/milestone/alarmDefinitionsRetreival');
const { filterCameraEvents } = require('../../data_processing/milestone/eventsDataProcessing');
const { filterAlarmDefinitions } = require('../../data_processing/milestone/alarmDefinitionsDataProcessing');
const alarmManager = require('../../integrations/alarmManagement/alarmManagement');
const logger = require('../../../util/logger');

/**
 * Fetches and processes camera event types, storing them in the provided eventStore.
 *
 * @param {string} domain - The Milestone domain.
 * @param {string} token - The authentication token.
 * @param {Array} eventStore - Storage array for event types.
 * @returns {Promise<void>}
 */
async function loadCameraEventTypeCache(domain, token, eventStore) {
    try {
        logger.info('EVENT FETCH', `Fetching and processing camera event types...`);
        
        const eventTypes = await getEventTypes(domain, token);
        const filteredEvents = filterCameraEvents(eventTypes);

        eventStore.length = 0; // Clear existing events
        eventStore.push(...filteredEvents); // Store filtered events

        logger.info('EVENT FETCH', `Loaded ${filteredEvents.length} camera events.`);
    } catch (error) {
        logger.error('EVENT FETCH', `Error loading camera events: ${error}`);
        throw error;
    }
}

/**
 * Fetches and processes alarm definitions, directly storing them in alarmManager.
 *
 * @param {string} domain - The Milestone domain.
 * @param {string} token - The authentication token.
 * @param {string} prefix - The prefix to filter trigger events.
 * @returns {Promise<void>}
 */
async function loadAlarmDefinitionCache(domain, token, prefix) {
    try {
        logger.info('ALARM FETCH', `Fetching alarm definitions and user-defined events...`);
        
        const userDefinedEvents = await getUserDefinedEvents(domain, token);
        const alarmDefinitions = await getAlarmDefinitions(domain, token);
        const filteredAlarms = filterAlarmDefinitions(alarmDefinitions, prefix, userDefinedEvents);

        // Directly load alarms into alarmManager instead of an intermediary store
        alarmManager.loadAlarmDefinitions(filteredAlarms);

        logger.info('ALARM FETCH', `Loaded ${filteredAlarms.length} alarm definitions.`);
    } catch (error) {
        logger.error('ALARM FETCH', `Error loading alarm definitions: ${error}`);
        throw error;
    }
}

module.exports = { loadCameraEventTypeCache, loadAlarmDefinitionCache };
