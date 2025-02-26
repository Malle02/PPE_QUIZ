const dbManager = require("../../../sequelize/mapper/databaseManager"); // Database Singleton

const { recorder, camera, ptz_settings } = dbManager.getDbLoaderDB(); // Use the privileged DB

/**
 * Inserts recorders into the database.
 * @param {Array} recorders - Array of recorder objects.
 */
async function insertRecorders(recorders) {
  if (recorders.length > 0) {
    await recorder.bulkCreate(recorders);
    console.log(`✅ Inserted ${recorders.length} recorders.`);
  } else {
    console.log("⚠️ No recorders to insert.");
  }
}

/**
 * Inserts cameras into the database.
 * @param {Array} cameras - Array of camera objects.
 */
async function insertCameras(cameras) {
  if (cameras.length > 0) {
    await camera.bulkCreate(cameras);
    console.log(`✅ Inserted ${cameras.length} cameras.`);
  } else {
    console.log("⚠️ No cameras to insert.");
  }
}

/**
 * Inserts PTZ settings into the database (only for cameras where `ptzEnabled === true`).
 * @param {Array} cameras - Array of camera objects to filter PTZ settings.
 */
async function insertPtzSettings(cameras) {
  const ptzData = cameras.filter(cam => cam.ptz_enabled).map(cam => ({
    camera_id: cam.id, // Use the same ID as the Camera
    is_center_on_position_in_view_supported: cam.is_center_on_position_in_view_supported || false,
    is_ptz_diagonal_supported: cam.is_ptz_diagonal_supported || false,
    is_ptz_home_supported: cam.is_ptz_home_supported || false,
  }));

  if (ptzData.length > 0) {
    await ptz_settings.bulkCreate(ptzData);
    console.log(`✅ Inserted ${ptzData.length} PTZ settings.`);
  } else {
    console.log("⚠️ No PTZ settings to insert.");
  }
}

module.exports ={
    insertRecorders,
    insertCameras,
    insertPtzSettings
}