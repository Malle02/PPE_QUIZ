/**
 * Filters alarm definitions based on the provided prefix and user-defined events.
 * This version removes processing of alarm categories and priorities, assuming they will be retrieved from the database.
 *
 * @param {Array} alarmDefinitions - The list of alarm definitions to filter.
 * @param {string} prefix - The prefix to filter trigger event names.
 * @param {Array} userDefinedEvents - The array of user-defined events.
 * @returns {Array} - The filtered list of alarm definitions with only essential details.
 */
function filterAlarmDefinitions(alarmDefinitions, prefix, userDefinedEvents) {
    return alarmDefinitions.map((alarm) => {
        // Find the matching trigger event in the user-defined events array
        const matchingEvent = alarm.triggerEventlist.find((triggerEvent) =>
            userDefinedEvents.some(
                (userEvent) =>
                    userEvent.id === triggerEvent.id && userEvent.name.startsWith(prefix)
            )
        );

        // Return the formatted alarm definition with only ID references for priority & category
        return {
            id: alarm.id,
            name: alarm.name,
            camera_id: alarm.sourceList?.[0]?.id ?? null, // Assuming `Source` exists in the alarm object
            trigger_event_id: matchingEvent ? matchingEvent.id : null, // Store only the ID or null
            priority_id: alarm.priority ?? null, // Store priority as a GUID reference
            category_id: alarm.category ?? null, // Store category as a GUID reference
        };
    });
}

module.exports = { filterAlarmDefinitions };

