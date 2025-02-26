/**
 * Processes alarm priorities 
 * @param {Array} alarmPriorities - Raw alarm priorities data from API.
 * @returns {Array} - Processed alarm priorities.
 */
function processAlarmPriorities(alarmPriorities) {
    return alarmPriorities.map(priority => ({
        id: priority.id, 
        name: priority.name,
        level: priority.level 
    }));
}

/**
 * Processes alarm categories 
 * @param {Array} alarmCategories - Raw alarm categories data from API.
 * @returns {Array} - Processed alarm categories.
 */
function processAlarmCategories(alarmCategories) {
    return alarmCategories.map(category => ({
        id: category.id, 
        name: category.name,
        level: category.level
    }));
}

/**
 * Processes alarm states
 * @param {Array} alarmStates - Raw alarm states data from API.
 * @returns {Array} - Processed alarm states.
 */
function processAlarmStates(alarmStates) {
    return alarmStates.map(state => ({
        id: state.id, 
        name: state.name,
        level: state.level
    }));
}

module.exports = { processAlarmPriorities, processAlarmCategories, processAlarmStates };
