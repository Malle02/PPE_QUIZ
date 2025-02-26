const { Op,literal } = require('sequelize');
const { validate: isUUID } = require('uuid');
const dbManager = require('../sequelize/mapper/databaseManager');
const { report, video_alarm } = dbManager.getClientsDB();

// Constants
const DEFAULT_AMOUNT = 100;
const MAX_AMOUNT = 100;

const getPaginatedReports = async (req, res) => {
    try {
        let { ref_report, time_report, direction, amount } = req.query;

        // 🔹 Validate "amount" (default: 100, max: 100)
        amount = Math.min(parseInt(amount) || DEFAULT_AMOUNT, MAX_AMOUNT);

        // 🔹 Validate "direction" (must be "older" or "newer", default = "older")
        if (direction && direction !== 'older' && direction !== 'newer') {
            return res.status(400).json({ error: "Invalid 'direction' value. Use 'older' or 'newer'." });
        }
        const isNewer = direction === 'newer';
        const sortOrder = isNewer ? 'ASC' : 'DESC';

        // 🔹 Validate "time_report" if provided (must be a valid timestamp)
        if (time_report && isNaN(Date.parse(time_report))) {
            return res.status(400).json({ error: "Invalid 'time_report' value. Must be a valid timestamp." });
        }

        let whereCondition = {};

        // 🔹 If filtering by timestamp directly (time_report)
        if (time_report) {
            whereCondition.time = isNewer
                ? { [Op.gt]: literal(`'${time_report}'::TIMESTAMP`) }
                : { [Op.lt]: literal(`'${time_report}'::TIMESTAMP`) };
        }

        // 🔹 If filtering by Id (ref_report)
        if (ref_report) {
            if (!isUUID(ref_report)) {
                return res.status(400).json({ error: "Invalid 'ref_report' UUID format." });
            }

            // 🔹 Fetch reference report to get its timestamp
            const referenceReport = await report.findByPk(ref_report, {
                attributes: [[literal('"time"::TEXT'), 'time']],
                raw: true,
            });

            if (!referenceReport) {
                return res.status(404).json({ error: "Reference report not found." });
            }

            const referenceTime = referenceReport.time;
            console.log(`Filtering ${isNewer ? 'newer' : 'older'} reports from time:`, referenceTime);

            whereCondition.time = isNewer
                ? { [Op.gt]: literal(`'${referenceTime}'::TIMESTAMP`) }
                : { [Op.lt]: literal(`'${referenceTime}'::TIMESTAMP`) };
        }

        // 🔹 Fetch paginated reports with strict time filtering
        const reports = await report.findAll({
            attributes: ['id', 'operator_id', 'alarm_id', 'alarm_type', 'time', 'location', 'observation', 'attachments'],
            where: whereCondition,
            order: [['time', sortOrder]], // ✅ Sorting applied after filtering
            limit: amount,
            raw: true,
            subQuery: false,
        });

        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching paginated reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createReport = async (req, res) => {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
        // Extract data
        const { video_alarm_id, operator_id, alarm_type, location, observation, attachments } = req.body;

        // Validate video_alarm_id (must be a valid UUID)
        if (!isUUID(video_alarm_id)) {
            return res.status(400).json({ error: "Invalid 'video_alarm_id' UUID format." });
        }

        // Check if the video_alarm exists
        const videoAlarm = await video_alarm.findByPk(video_alarm_id, { transaction });
        if (!videoAlarm) {
            await transaction.rollback(); // Rollback and exit
            return res.status(404).json({ error: "Video alarm not found." });
        }

        // Create the new report and get its ID
        const newReport = await report.create(
            {
                operator_id,
                alarm_id: video_alarm_id, // Link report to video_alarm
                alarm_type,
                time: new Date(),
                location,
                observation,
                attachments,
            },
            { transaction }
        );

        // Update the video_alarm with the report_id
        await video_alarm.update(
            { report_id: newReport.id }, 
            { where: { id: video_alarm_id }, transaction }
        );

        // Commit transaction (finalize changes)
        await transaction.commit();

        // Return the created report
        res.status(201).json(newReport);
    } catch (error) {
        await transaction.rollback(); // Rollback changes if an error occurs
        console.error("Error creating new report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getPaginatedReports, createReport };




