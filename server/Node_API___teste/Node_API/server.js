const http = require('http');
const express = require('express');

require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const milestoneRealtimeClient = require('./services/realtimeEvents/milestone/milestoneRealtimeEvents');
const { loadCameraEventTypeCache, loadAlarmDefinitionCache } = require('./services/caching/milestone/loadEventTypesCache');
const { loadDatabaseFromMilestone } = require('./services/database_loading/milestone/loadDatabaseFromMilestone');
const alarmManager = require('./services/integrations/alarmManagement/alarmManagement');
const socketManager = require('./realtimeEvents/socketIoManager');
const PORT = 5000;
const logger = require('./util/logger');
const MetadataUtil  = require('./util/configFileHandler');
const session = require('express-session');


const camerasRoutes = require('./routes/camerasRoute');
const recordersRoutes = require('./routes/recordersRoute');
const alarmsRoutes = require('./routes/alarmsRoute');
const reportsRoutes = require('./routes/reportsRoute');
const authRoute = require('./routes/authRoute');



//Note: Still adapted for dev, must be a strict singleton in prod
const  MilestoneApiTokenManager = require('./services/auth/milestone/milestoneApiTokenManager');

// Disables certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Cache
let eventTypes = [];
let alarms = [];

//Our convention prefix to distinguish alarm events
const prefix = 'DVNTALRM'

// Credentials (replace with environment variables later)
const username = 'BIFROST';
const password = 'Securepass-96';
const domain = '192.168.1.129';
// Using the fetcuhing fuction later in prod
let token = ""; // Replace with your token

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Session management middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'yourStrongSecretHere',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 } // 1 hour session
}));




app.use('/api/cameras',camerasRoutes);
app.use('/api/recorders',recordersRoutes);
app.use('/api/alarms',alarmsRoutes);
app.use('/api/reports',reportsRoutes);
app.use('/api/auth', authRoute);



// Create an HTTP server and integrate with socket.io
const server = http.createServer(app);
socketManager.init(server,alarmManager);



// Main function (will be in a separate module related to the specific vms to ease the load by choice on configuration)
async function main() {
    try {
        MetadataUtil.loadInstallationTimestamp();
        
        MilestoneApiTokenManager.init(domain, username, password);
        token = await MilestoneApiTokenManager.getInstance().getToken();

        // Load event types into cache
        await loadCameraEventTypeCache(domain, token, eventTypes);
        logger.info('CACHE', 'Camera event types loaded');

        // Load alarms into cache
        await loadAlarmDefinitionCache(domain, token, alarms, prefix);
        logger.info('CACHE', 'Alarms cache loaded');

        // Check if database_initial_load exists
        let dbLoadStatus = MetadataUtil.read('isDatabaseInitiallyLoaded');
        
        if (dbLoadStatus === null || dbLoadStatus === false) {
            logger.info('DATABASE', 'Starting initial database load from Milestone...');
            
            await loadDatabaseFromMilestone(domain, username, password, token, alarms);
            logger.info('DATABASE', 'Database loaded successfully.');

            // Set database_initial_load to true (so next time we update instead)
            MetadataUtil.write('isDatabaseInitiallyLoaded', true);
        } else {
            // No need to load database, continue with normal flow
            logger.info('DATABASE', 'Skipping initial database load. Database already initialized.');
        }

        await alarmManager.runInitialization(domain, token);

        // Initialize Milestone WebSocket client
        milestoneRealtimeClient.initialize(domain, token, eventTypes);
        logger.info('SOCKET.IO SERVER', 'WebSocket client initialized and subscribed to events.');
    } catch (error) {
        logger.error('INITIALIZATION', 'Error in main function: ' + error);
    }
}


// Start the main process
main();

// Start the server
server.listen(PORT, () => {
    logger.info('SERVER', `Server is running on http://localhost:${PORT}`);
});
