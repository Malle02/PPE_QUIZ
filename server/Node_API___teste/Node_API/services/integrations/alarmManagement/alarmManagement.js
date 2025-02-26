const fs = require('fs');
const path = require('path');
const { literal, QueryTypes } = require('sequelize');
const { getLatestAlarms } = require('../../data_retreival/milestone/LatestAlarmsRetreival');
const { updateAlarmRequest } = require('./alarmUpdateRequest');
const dbManager = require('../../../sequelize/mapper/databaseManager');
const { video_alarm } = dbManager.getDbLoaderDB();
const clients_channel = dbManager.getClientsDBForRawQueries();
const socketManager = require('../../../realtimeEvents/socketIoManager');
const MilestoneApiTokenManager = require('../../auth/milestone/milestoneApiTokenManager');
const MetadataUtil = require('../../../util/configFileHandler');

class AlarmManager {
  constructor() {
    if (!AlarmManager.instance) {
      this.domain = null; //TODO: just for now, later we'll use the environment var
      this.alarmDefinitions = [];
      this.alarmClassifications = {
        alarmPriorities: [],
        alarmCategories: [],
        alarmStates: []
      };
      this.activeAlarms = [];
      this.lastAlarmTimestamp = null;
      this.oldestActiveAlarmTimestamp = null;
      this.installationTimestamp = MetadataUtil.loadInstallationTimestamp();
      AlarmManager.instance = this;
    }
    return AlarmManager.instance;
  }


  // // WARNING: Might be just reading a field of a more general purpose json as it can be more than just a creation time save file
  // loadInstallationTimestamp() {
  //   const filePath = path.resolve(__dirname, '../../../config/metadata.json');

  //   try {
  //     // Ensure the directory exists before accessing the file
  //     const dir = path.dirname(filePath);
  //     if (!fs.existsSync(dir)) {
  //       fs.mkdirSync(dir, { recursive: true });
  //     }

  //     if (fs.existsSync(filePath)) {
  //       const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  //       return data.installationTimestamp;
  //     }

  //     const timestamp = new Date();
  //     const formattedTimestamp = timestamp.toISOString().replace('T', ' ').replace('Z', '');
  //     const jsonData = JSON.stringify({ installationTimestamp: formattedTimestamp }, null, 2);

  //     fs.writeFileSync(filePath, jsonData);
  //     return timestamp;
  //   } catch (err) {
  //     console.error('Error loading installation timestamp:', err);
  //     return new Date();
  //   }
  // }


  loadOldestAlarmTimestamp() {
    const filePath = path.resolve(__dirname, '../../../config/metadata.json'); // Path to the same file, assuming same structure
  
    try {
      // Ensure the directory exists before accessing the file
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Check if 'oldestAlarmTimestamp' exists in the file
        if (data.oldestAlarmTimestamp) {
          // Subtract 3 seconds from the timestamp
          const timestamp = new Date(data.oldestAlarmTimestamp);
          timestamp.setSeconds(timestamp.getSeconds() - 3);
          const formattedTimestamp = timestamp.toISOString().replace('T', ' ').replace('Z', '');
          return formattedTimestamp;
        } else {
          return null; // Return null if 'oldestAlarmTimestamp' is not found
        }
      }
  
      return null; // Return null if file does not exist
  
    } catch (err) {
      console.error('Error loading oldest alarm timestamp:', err);
      return null; // Return null if there was an error
    }
  }
  
  getActiveAlarms() {
    return this.activeAlarms;
  }
  
  loadAlarmDefinitions(alarmDefs) {
    if (!Array.isArray(alarmDefs)) {
      console.error("Invalid alarm definitions: Expected an array.");
      return;
    }
  
    if (this.alarmDefinitions.length > 0) {
      console.warn("Alarm definitions already loaded. Skipping reinitialization.");
      return;
    }
  
    this.alarmDefinitions = [...alarmDefs]; // Clone to prevent external modifications
  
    Object.freeze(this.alarmDefinitions); // ❄️ Freeze only after first load
  
  }  

  async getAlarmClassifications() {
      try {
          const result = await clients_channel.query(
              "SELECT video_monitoring.get_alarm_metadata() AS metadata",
              {
                  type: QueryTypes.SELECT
              }
          );

          return result[0].metadata;
      } catch (error) {
          console.error("Error fetching alarm classifications:", error);
      }
  };

  loadAlarmClassifications(alarmPriorities, alarmCategories, alarmStates) {
    if (!Array.isArray(alarmPriorities) || !Array.isArray(alarmCategories) || !Array.isArray(alarmStates)) {
      console.error("Invalid classifications: Expected all parameters to be arrays.");
      return;
    }
  
    if (
      this.alarmClassifications.alarmPriorities.length > 0 ||
      this.alarmClassifications.alarmCategories.length > 0 ||
      this.alarmClassifications.alarmStates.length > 0
    ) {
      console.warn("Alarm classifications already loaded. Skipping reinitialization.");
      return;
    }
  
    this.alarmClassifications.alarmPriorities = [...alarmPriorities];
    this.alarmClassifications.alarmCategories = [...alarmCategories];
    this.alarmClassifications.alarmStates = [...alarmStates];
  
    // Freeze the whole alarmClassifications object
    Object.freeze(this.alarmClassifications);
  
    console.log(`Loaded ${alarmPriorities.length} priorities, ${alarmCategories.length} categories, and ${alarmStates.length} states.`);
  }
  
  async runInitialization(domain, token) {
        try {
            this.domain = domain;

            // Step 1: Load alarm classifications
            const classifications = await this.getAlarmClassifications();

            if (classifications) {
                this.loadAlarmClassifications(
                    classifications.priorities,
                    classifications.categories,
                    classifications.states
                );
            }

            // Step 2: Load oldest timestamp
            this.oldestActiveAlarmTimestamp = this.loadOldestAlarmTimestamp();

            // Step 3: If it's null, fallback to installation timestamp
            if (!this.oldestActiveAlarmTimestamp) {
                this.oldestActiveAlarmTimestamp = this.installationTimestamp;
            }

            console.log(`Using reference timestamp: ${this.oldestActiveAlarmTimestamp}`);

            // Step 4: Retrieve latest active alarms
            const latestAlarms = await getLatestAlarms(domain, token, this.oldestActiveAlarmTimestamp);
            console.log(`Retrieved ${latestAlarms.length} new alarms from Milestone.`);

            // Step 5: If oldestActiveAlarmTimestamp == installationTimestamp, find the true oldest alarm time
            if (this.oldestActiveAlarmTimestamp === this.installationTimestamp && latestAlarms.length > 0) {
                const oldestTimestamp = latestAlarms.reduce((min, alarm) => 
                    alarm.time < min ? alarm.time : min, 
                    latestAlarms[0].time
                );

                this.oldestActiveAlarmTimestamp = oldestTimestamp;
                this.writeOldestAlarmTimestamp(oldestTimestamp);
            }

            // Step 6: Determine the latest timestamp from the alarms
            if (latestAlarms.length > 0) {
                const latestTimestamp = latestAlarms.reduce((max, alarm) => 
                    alarm.time > max ? alarm.time : max, 
                    latestAlarms[0].time
                );

                this.lastAlarmTimestamp = latestTimestamp;
            } else {
                this.lastAlarmTimestamp = this.oldestActiveAlarmTimestamp;
            }

            // Step 7: Add alarms to active alarms collection
            if (latestAlarms.length > 0) {
                latestAlarms.forEach(alarm => this.addActiveAlarm(alarm));
                console.log(`Active alarms collection populated with ${latestAlarms.length} alarms.`);
            }

            console.log(`Last alarm timestamp set to: ${this.lastAlarmTimestamp}`);

        } catch (error) {
            console.error("Alarm manager initialization error:", error);
        }
    }



  writeOldestAlarmTimestamp(newTimestamp) {
      const filePath = path.resolve(__dirname, '../../../config/metadata.json');

      try {
          let data = {};
          
          // Load existing data if the file exists
          if (fs.existsSync(filePath)) {
              data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          }

          // Format timestamp to remove T, Z, and GMT details
          const timestamp = new Date(newTimestamp);
          const formattedTimestamp = timestamp.toISOString().replace('T', ' ').replace('Z', '');

          // Update the oldest alarm timestamp
          data.oldestAlarmTimestamp = formattedTimestamp;

          // Write updated JSON back to the file
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

          console.log(`Updated oldest alarm timestamp: ${formattedTimestamp}`);
      } catch (err) {
          console.error('Error writing oldest alarm timestamp:', err);
      }
  }

  async getLatestClosedAlarmTime() {
      try {
          const latestAlarm = await video_alarm.findOne({
              attributes: [[literal('"time"::TEXT'), 'time']], 
              order: [['time', 'DESC']], 
              limit: 1,
              raw: true,
          });

          return latestAlarm ? latestAlarm.time : null;
      } catch (error) {
          console.error("Error fetching latest alarm time:", error);
          return null;
      }
  }



  processAlarm(alarm) {
      if (!alarm) {
          console.error("No alarm provided for processing.");
          return;
      }

      console.log(`Processing alarm with ID: ${alarm.id}`);

      // Remove assignedTo field if it exists
      delete alarm.assignedTo;

      // Transform source to camera UUID (remove "cameras/" prefix)
      if (alarm.source && alarm.source.startsWith("cameras/")) {
          const cameraId = alarm.source.substring(8); // Removes the "cameras/" prefix
          alarm.source = cameraId; // Update the source to just the camera UUID
      }

      // Find the matching alarm definition based on name, source, and category
      const alarmDefinition = this.alarmDefinitions.find(def => 
          def.name === alarm.name && 
          def.camera_id === alarm.source
      );

      if (alarmDefinition) {
          console.log(`Found matching alarm definition for alarm ${alarm.id}.`);
          alarm.alarm_definition_id = alarmDefinition.id; // Assign the alarm definition id
      } else {
          console.warn(`No matching alarm definition found for alarm ${alarm.id}.`);
      }
  }

  async onNewActiveAlarmEvent(event) {
      try {
          // Step 1: Get the alarm definition ID from the event
          const alarmDef = this.getAlarmDefinitionFromEvent(event);
          const token = await MilestoneApiTokenManager.getInstance().getToken();

          // Step 2: Query the latest alarms since the last known timestamp
          const latestAlarms = await getLatestAlarms(this.domain, token, this.lastAlarmTimestamp);

          // Step 3: Find the matching alarm using the definition we deduced
          const matchingAlarm = latestAlarms.find(alarm =>
              alarm.category.id === alarmDef.category_id && alarm.name === alarmDef.name
          );

          if (!matchingAlarm) {
              console.warn("No matching alarm found for event:", event);
              return;
          }

          // Step 4: Update lastAlarmTimestamp to the newest alarm's timestamp
          if (!this.lastAlarmTimestamp || matchingAlarm.time > this.lastAlarmTimestamp) {
              this.lastAlarmTimestamp = matchingAlarm.time;
              console.log(`Updated lastAlarmTimestamp to: ${this.lastAlarmTimestamp}`);
          }

          // Step 5: Add the alarm to the active alarms collection
          this.addActiveAlarm(matchingAlarm);

          // Step 6: If the active alarms collection was empty, update oldestActiveAlarmTimestamp
          if (this.activeAlarms.length === 1) { 
              this.oldestActiveAlarmTimestamp = matchingAlarm.time;
              this.writeOldestAlarmTimestamp(matchingAlarm.time); // Persist change
              console.log(`Updated oldestActiveAlarmTimestamp to: ${matchingAlarm.time}`);
          }

      } catch (error) {
          console.error("Error processing new active alarm:", error);
      }
  }


  getAlarmDefinitionFromEvent(event){
        const matchingAlarm = this.alarmDefinitions.find((alarm) => alarm.trigger_event_id === event.type);
        if (matchingAlarm) {
            return matchingAlarm;
        }
  }

  addActiveAlarm(alarm) {
    if (!alarm) {
      console.error("No alarm provided to add.");
      return;
    }

    console.log(`Adding alarm ${alarm.id} to active alarms.`);

    // Process alarm - remove assignedTo and transform source
    this.processAlarm(alarm);

    // Add the processed alarm to the active alarms list
    this.activeAlarms.push(alarm);
    console.log(`Alarm ${alarm.id} added to active alarms.`);

    //TODO: Adding a header enum later to the message to distinguish new, update and close alarm
    socketManager.emit(socketManager.CHANNELS.ALARM_EVENTS,{op: "new_alarm", data: alarm});
  }


  async updateAlarm(alarmId, input_comment, input_priority_uuid, input_state_uuid) {
      const alarm = this.activeAlarms.find((alarm) => alarm.id === alarmId);
      if (!alarm) {
        throw new Error(`Alarm with ID ${alarmId} not found.`);
      }

      // Validate the priority and state UUIDs
      const priorityExists = this.alarmClassifications.alarmPriorities.some(
        (priority) => priority.id === input_priority_uuid
      );
      const stateExists = this.alarmClassifications.alarmStates.some(
        (state) => state.id === input_state_uuid
      );

      if (!priorityExists) {
        throw new Error(`Invalid priority UUID: ${input_priority_uuid}`);
      }

      if (!stateExists) {
        throw new Error(`Invalid state UUID: ${input_state_uuid}`);
      }

      // Perform the update request
      try {
        const token = await MilestoneApiTokenManager.getInstance().getToken();
        const updatedAlarm = await updateAlarmRequest(
            this.domain,
            token,
            alarmId,
            input_comment,
            input_priority_uuid,
            input_state_uuid,
        );

        // Processing the updated alarm 
        this.processAlarm(updatedAlarm);
        
        // If the state is 'closed', save the alarm and remove it from active alarms
        console.log('updated alarm: ',updatedAlarm);
        if (updatedAlarm.state.name === 'Closed') {
            await this.closeAlarm(updatedAlarm);  // Close the alarm in active alarms
        } else {
            // Replace the corresponding alarm in active alarms with the updated data
            const alarmIndex = this.activeAlarms.findIndex(alarm => alarm.id === alarmId);
            if (alarmIndex !== -1) {
                this.activeAlarms[alarmIndex] = updatedAlarm;  // Replace alarm
                console.log(`Alarm ${alarmId} updated in active alarms.`);
            }
        }

        return updatedAlarm; // Return updated alarm
    } catch (error) {
        throw new Error(`Error updating alarm with ID ${alarmId}: ${error.message}`);
    }
  }



  async closeAlarm(alarmData) {
      if (!alarmData) {
          console.error("No alarm data provided for closing.");
          return;
      }

      // Check if the alarm exists in the active alarms list
      const alarmIndex = this.activeAlarms.findIndex(alarm => alarm.id === alarmData.id);

      if (alarmIndex !== -1) {
          console.log(`Closing alarm with ID: ${alarmData.id}.`);

          try {
              // First, save the alarm (in case it's closed)
              await this.saveAlarm(alarmData);

              // Remove the alarm from the active alarms list
              this.activeAlarms.splice(alarmIndex, 1);
              console.log(`Alarm ${alarmData.id} removed from active alarms.`);

              // Check if this was the oldest active alarm
              if (alarmData.time === this.oldestActiveAlarmTimestamp) {
                  if (this.activeAlarms.length > 0) {
                      // Find the next oldest alarm timestamp
                      const nextOldestTimestamp = this.activeAlarms.reduce((min, alarm) => 
                          alarm.time < min ? alarm.time : min, this.activeAlarms[0].time
                      );

                      this.oldestActiveAlarmTimestamp = nextOldestTimestamp;
                      this.writeOldestAlarmTimestamp(nextOldestTimestamp);
                      console.log(`Updated oldestActiveAlarmTimestamp to: ${nextOldestTimestamp}`);
                  } else {
                      console.log("No active alarms left. Keeping oldestActiveAlarmTimestamp unchanged.");
                  }
              }

          } catch (error) {
              console.error(`Failed to save alarm with ID: ${alarmData.id}. Error: ${error.message}`);
          }
      } else {
          console.warn(`Alarm with ID: ${alarmData.id} not found in active alarms.`);
      }
  }



  async saveAlarm(alarmData) {
      if (!alarmData) {
          console.error("No alarm data provided for saving.");
          return;
      }

      // Check if the alarm state is 'closed' before saving
      if (alarmData.state && alarmData.state.name === 'Closed') {
          // Prepare the alarm data with only the required fields: id, alarm_definition_id, and time
          const alarmToSave = {
              id: alarmData.id,
              alarm_definition_id: alarmData.alarm_definition_id,
              time: alarmData.time,
          };

          console.log(`Saving closed alarm with ID: ${alarmData.id} to the database.`);

          try {
              // Save to the database using Sequelize (or your ORM method)
              await video_alarm.create(alarmToSave);
              console.log(`Alarm ${alarmData.id} saved successfully.`);
              
              // Optionally, remove it from active alarms after saving (handled in closeAlarm)
              // No need to call closeAlarm here as it's done in closeAlarm method
          } catch (error) {
              console.error(`Error saving alarm ${alarmData.id} to the database:`, error);
          }
      } else {
          console.log(`Alarm ${alarmData.id} is not closed. Skipping save.`);
      }
  }

}

// Singleton instance
const instance = new AlarmManager();

module.exports = instance;
