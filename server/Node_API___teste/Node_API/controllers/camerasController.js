const dbManager = require('../sequelize/mapper/databaseManager');
const { camera, ptz_settings  } = dbManager.getClientsDB();

// Fetch all cameras
const getAllCameras = async (req, res) => {
    try {
        const cameras = await camera.findAll({
            include: [{
                model: ptz_settings,
                as: 'ptz_setting',
                required: false, // Keep cameras even if no PTZ settings exist
                attributes: { exclude: ['camera_id'] } // Exclude camera_id
            }]
        }); // Fetch all cameras

        res.status(200).json(cameras);
    } catch (error) {
        console.error("Error fetching cameras:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch a specific camera by ID
const getCameraById = async (req, res) => {
    try {
        const { id } = req.params;
        const cameraData = await camera.findByPk(id, {
            include: [{
                model: ptz_settings,
                as: 'ptz_setting',
                required: false, // Keep camera even if no PTZ settings exist
                attributes: { exclude: ['camera_id'] } // Exclude camera_id
            }]
        });

        if (!cameraData) {
            return res.status(404).json({ message: "Camera not found" });
        }

        res.status(200).json(cameraData);
    } catch (error) {
        console.error("Error fetching camera by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch a specific camera's ptz settings
const getPTZSettings = async (req, res) => {
    try {
        const { id } = req.params; // Camera Id
        const ptzData = await ptz_settings.findByPk(id); // PTZ uses the same camera Id as PK

        if (!ptzData) {
            return res.status(404).json({ message: "PTZ settings not found for this camera" });
        }

        res.status(200).json(ptzData);
    } catch (error) {
        console.error("Error fetching PTZ settings:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllCameras,
    getCameraById,
    getPTZSettings,
};
