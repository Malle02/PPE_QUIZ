const { Op, QueryTypes,literal } = require('sequelize');
const { validate: isUUID } = require('uuid');
const dbManager = require('../sequelize/mapper/databaseManager');
const clients_channel = dbManager.getClientsDBForRawQueries();
const { video_alarm, video_alarm_definition } = dbManager.getClientsDB();
const alarmManager = require('../services/integrations/alarmManagement/alarmManagement')
  

// Constants
const DEFAULT_AMOUNT = 100;
const MAX_AMOUNT = 100;

// Fetches both alarm priorities and categories using a PostgreSQL function.
const getAlarmClassifications = async (req, res) => {
    try {
        const result = await clients_channel.query(
            "SELECT video_monitoring.get_alarm_metadata() AS metadata",
            {
                type: QueryTypes.SELECT
            }
        );

        res.status(200).json(result[0].metadata);
    } catch (error) {
        console.error("Error fetching alarm metadata:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


 // Fetch paginated alarms based on a reference alarm ID and time direction
 const getPaginatedAlarms = async (req, res) => {
    try {
        let { ref_alarm, time_alarm, direction, amount } = req.query;

        // 🔹 Validate "amount" (default: 100, max: 100)
        amount = Math.min(parseInt(amount) || DEFAULT_AMOUNT, MAX_AMOUNT);

        // 🔹 Validate "direction" (must be "older" or "newer", default = "older")
        if (direction && direction !== 'older' && direction !== 'newer') {
            return res.status(400).json({ error: "Invalid 'direction' value. Use 'older' or 'newer'." });
        }
        const isNewer = direction === 'newer';
        const sortOrder = isNewer ? 'ASC' : 'DESC';

        // 🔹 Validate "time_alarm" if provided (must be a valid timestamp)
        if (time_alarm && isNaN(Date.parse(time_alarm))) {
            return res.status(400).json({ error: "Invalid 'time_alarm' value. Must be a valid timestamp." });
        }

        let whereCondition = {};

        // 🔹 If filtering by timestamp directly (time_alarm)
        if (time_alarm) {
            whereCondition.time = isNewer
                ? { [Op.gt]: literal(`'${time_alarm}'::TIMESTAMP`) }
                : { [Op.lt]: literal(`'${time_alarm}'::TIMESTAMP`) };
        }

        // 🔹 If filtering by Id (ref_alarm)
        if (ref_alarm) {
            if (!isUUID(ref_alarm)) {
                return res.status(400).json({ error: "Invalid 'ref_alarm' UUID format." });
            }

            // 🔹 Fetch reference alarm to get its timestamp
            const referenceAlarm = await video_alarm.findByPk(ref_alarm, {
                attributes: [[literal('"time"::TEXT'), 'time']],
                raw: true,
            });

            if (!referenceAlarm) {
                return res.status(404).json({ error: "Reference alarm not found." });
            }

            const referenceTime = referenceAlarm.time;
            console.log(`Filtering ${isNewer ? 'newer' : 'older'} alarms from time:`, referenceTime);

            whereCondition.time = isNewer
                ? { [Op.gt]: literal(`'${referenceTime}'::TIMESTAMP`) }
                : { [Op.lt]: literal(`'${referenceTime}'::TIMESTAMP`) };
        }

        // 🔹 Fetch paginated alarms with JOIN to include alarm definitions
        const alarms = await video_alarm.findAll({
            attributes: ['id', 'time', 'report_id'],
            where: whereCondition,
            include: [
                {
                    model: video_alarm_definition,
                    as: 'alarm_definition',
                    attributes: ['id','name', 'category_id', 'priority_id', 'trigger_event_id', 'camera_id'], // ✅ Exclude id
                }
            ],
            order: [['time', sortOrder]], // ✅ Sorting applied after JOIN
            limit: amount,
            raw: true,
            nest: true, // ✅ Ensures nested structure
            subQuery: false,
        });

        res.status(200).json(alarms);
    } catch (error) {
        console.error("Error fetching paginated alarms:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Updates an active alarm state
const updateAlarm = async (req, res) => {
    try {
      const alarmId = req.params.id;
      const { comment, priority, state, assignedTo } = req.body;
  
      // Ensure alarmId is valid
      if (!isUUID(alarmId)) {
        return res.status(400).json({ message: 'Invalid alarm ID format.' });
      }
  
      // Call alarmManager to update alarm state
      const updatedAlarm = await alarmManager.updateAlarm(
        alarmId,
        comment,
        priority,
        state,
        assignedTo
      );
  
      return res.status(200).json({ message: 'Alarm updated successfully.', updatedAlarm });
  
    } catch (error) {
      console.error('Error updating alarm:', error.message);
      return res.status(500).json({ message: error.message });
    }
  };


module.exports = { getAlarmClassifications, getPaginatedAlarms, updateAlarm  };
