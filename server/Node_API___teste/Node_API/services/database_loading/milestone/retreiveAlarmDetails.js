const { getAlarmCategories } = require("../../data_retreival/milestone/alarmCategoriesRetreival");
const { getAlarmPriorities } = require("../../data_retreival/milestone/alarmPrioritiesRetreival");
const { getAlarmStates } = require("../../data_retreival/milestone/alarmStatesRetreival");


const { processAlarmPriorities, processAlarmCategories, processAlarmStates } = require("../../data_processing/milestone/alarmDetailsDataProcessing");
const logger = require("../.../../../../util/logger");

/**
 * Retrieves and processes alarm priorities.
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} - Cleaned alarm priorities.
 */
async function retrieveAndProcessAlarmPriorities(domain,token) {
    try {
        logger.info("ALARM PRIORITY RETRIEVAL", "Fetching and processing alarm priorities...");
        const rawPriorities = await getAlarmPriorities(domain,token);
        return processAlarmPriorities(rawPriorities);
    } catch (error) {
        logger.error("ALARM PRIORITY RETRIEVAL", `Error retrieving and processing alarm priorities: ${error}`);
        throw error;
    }
}

/**
 * Retrieves and processes alarm categories.
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} - Cleaned alarm categories.
 */
async function retrieveAndProcessAlarmCategories(domain,token) {
    try {
        logger.info("ALARM CATEGORY RETRIEVAL", "Fetching and processing alarm categories...");
        const rawCategories = await getAlarmCategories(domain,token);
        return processAlarmCategories(rawCategories);
    } catch (error) {
        logger.error("ALARM CATEGORY RETRIEVAL", `Error retrieving and processing alarm categories: ${error}`);
        throw error;
    }
}

/**
 * Retrieves and processes alarm states.
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} - Cleaned alarm states.
 */
async function retrieveAndProcessAlarmStates(domain,token) {
    try {
        logger.info("ALARM STATES RETRIEVAL", "Fetching and processing alarm states...");
        const rawStates = await getAlarmStates(domain,token);
        return processAlarmStates(rawStates);
    } catch (error) {
        logger.error("ALARM STATE RETRIEVAL", `Error retrieving and processing alarm states: ${error}`);
        throw error;
    }
}

module.exports = {
    retrieveAndProcessAlarmPriorities,
    retrieveAndProcessAlarmCategories,
    retrieveAndProcessAlarmStates
};
