const dbManager = require('../sequelize/mapper/databaseManager');
const { recorder } = dbManager.getClientsDB();

// Fetch all recorders
const getAllRecorders = async (req, res) => {
    try {
        const recorders = await recorder.findAll(); // ✅ Fetch all cameras
        res.status(200).json(recorders);
    } catch (error) {
        console.error("Error fetching recorders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch a specific recorder by ID
const getRecorderById = async (req, res) => {
    try {
        const { id } = req.params;
        const recorderData = await recorder.findByPk(id);

        if (!recorderData) {
            return res.status(404).json({ message: "Recorder not found" });
        }

        res.status(200).json(recorderData);
    } catch (error) {
        console.error("Error fetching recorder by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllRecorders,
    getRecorderById,
};