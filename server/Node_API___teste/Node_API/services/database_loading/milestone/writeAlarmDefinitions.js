const dbManager = require("../../../sequelize/mapper/databaseManager"); // Database Singleton

const { video_alarm_definition, alarm_priority, alarm_category, alarm_state } = dbManager.getDbLoaderDB(); // Use the privileged DB

/**
 * Inserts alarm definitions into the database.
 * @param {Array} alarmDefinitions - Array of alarm definition objects.
 */
async function insertAlarmDefinitions(alarmDefinitions) {
  if (alarmDefinitions.length > 0) {
    await video_alarm_definition.bulkCreate(alarmDefinitions);
    console.log(`✅ Inserted ${alarmDefinitions.length} alarm definitions.`);
  } else {
    console.log("⚠️ No alarm definitions to insert.");
  }
}

/**
 * Inserts alarm priorities into the database.
 * @param {Array} alarmPriorities - Array of alarm priority objects.
 */
async function insertAlarmPriorities(alarmPriorities) {
  if (alarmPriorities.length > 0) {
    await alarm_priority.bulkCreate(alarmPriorities);
    console.log(`✅ Inserted ${alarmPriorities.length} alarm priorities.`);
  } else {
    console.log("⚠️ No alarm priorities to insert.");
  }
}

/**
 * Inserts alarm categories into the database.
 * @param {Array} alarmCategories - Array of alarm category objects.
 */
async function insertAlarmCategories(alarmCategories) {
  if (alarmCategories.length > 0) {
    await alarm_category.bulkCreate(alarmCategories);
    console.log(`✅ Inserted ${alarmCategories.length} alarm categories.`);
  } else {
    console.log("⚠️ No alarm categories to insert.");
  }
}

/**
 * Inserts alarm states into the database.
 * @param {Array} alarmStates - Array of alarm category objects.
 */
async function insertAlarmStates(alarmStates) {
  if (alarmStates.length > 0) {
    await alarm_state.bulkCreate(alarmStates);
    console.log(`✅ Inserted ${alarmStates.length} alarm states.`);
  } else {
    console.log("⚠️ No alarm states to insert.");
  }
}

module.exports = {
  insertAlarmDefinitions,
  insertAlarmPriorities,
  insertAlarmCategories,
  insertAlarmStates
};
