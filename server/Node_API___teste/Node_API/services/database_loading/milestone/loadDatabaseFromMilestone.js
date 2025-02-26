const { getAllCamerasAndRecorders } = require("./retreiveCamerasAndRecorders"); // Import the data retrieval function
const { insertRecorders, insertCameras, insertPtzSettings } = require("./writeCamerasAndRecorders"); // Import DB writing functions

const { retrieveAndProcessAlarmCategories, retrieveAndProcessAlarmPriorities, retrieveAndProcessAlarmStates } = require("./retreiveAlarmDetails");
const { insertAlarmDefinitions, insertAlarmPriorities, insertAlarmCategories, insertAlarmStates } = require("./writeAlarmDefinitions"); // Import alarm DB writing functions

/**
 * Fetches and stores cameras, recorders, and alarm-related data into the database.
 * @param {string} domain - The Milestone domain.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 * @param {string} token - The authentication token.
 */
async function loadDatabaseFromMilestone(domain, username, password, token, alarmDefinitionsCache) {
  try {
    console.log("🚀 Fetching recorders and cameras data...");
    const { Recorders, Cameras } = await getAllCamerasAndRecorders(domain, username, password, token);

    console.log("🚀 Inserting recorders into the database...");
    await insertRecorders(Recorders);
   
    console.log("🚀 Inserting cameras into the database...");
    await insertCameras(Cameras);
    await insertPtzSettings(Cameras);

    console.log("🚀 Fetching and inserting alarm priorities...");
    const alarmPriorities = await retrieveAndProcessAlarmPriorities(domain,token);
    await insertAlarmPriorities(alarmPriorities);

    console.log("🚀 Fetching and inserting alarm categories...");
    const alarmCategories = await retrieveAndProcessAlarmCategories(domain,token);
    await insertAlarmCategories(alarmCategories);

    console.log("🚀 Fetching and inserting alarm states...");
    const alarmStates = await retrieveAndProcessAlarmStates(domain,token);
    await insertAlarmStates(alarmStates);

    console.log("🚀 Inserting alarm definitions...");
    await insertAlarmDefinitions(alarmDefinitionsCache);

    console.log("🎉 All data successfully stored in the database!");
  } catch (error) {
    console.error("❌ Error processing and storing data:", error);
  }
}

module.exports = { loadDatabaseFromMilestone };

