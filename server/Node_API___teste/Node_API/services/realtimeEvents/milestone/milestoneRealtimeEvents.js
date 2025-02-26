const WebSocket = require('ws');
const alarmManager = require('../../integrations/alarmManagement/alarmManagement');
const socketManager = require('../../../realtimeEvents/socketIoManager');

class MilestoneRealtimeClient {
    constructor() {
        if (!MilestoneRealtimeClient.instance) {
            this.ws = null;
            this.isConnected = false;
            this.eventTypes = [];
            MilestoneRealtimeClient.instance = this;
        }
        return MilestoneRealtimeClient.instance;
    }

    initialize(domain, token, eventTypes) {
        if (this.isConnected) {
            console.warn('Milestone WebSocket is already initialized.');
            return;
        }

        this.eventTypes = [...eventTypes];

        const url = `wss://${domain}/api/ws/events/v1`;
        this.ws = new WebSocket(url, {
            headers: { Authorization: `Bearer ${token}` },
            rejectUnauthorized: false,
        });

        this.ws.on('open', () => {
            console.log(`Connected to Milestone WebSocket server at ${url}`);
            this.isConnected = true;
            
            const startSessionMessage = {
                command: 'startSession',
                commandId: 1,
                sessionId: '',
                eventId: '',
            };
            console.log('Sending startSession command:', startSessionMessage);
            this.ws.send(JSON.stringify(startSessionMessage));
        });

        this.ws.on('message', (data) => {
            const parsedData = JSON.parse(data);
            console.log('Message from Milestone:', parsedData);

            if (parsedData.commandId === 1 && parsedData.sessionId) {
                console.log('Session started:', parsedData);
                
                const addSubscriptionMessage = {
                    command: 'addSubscription',
                    commandId: 2,
                    filters: [
                        {
                            modifier: 'include',
                            resourceTypes: ['cameras', 'userDefinedEvents'],
                            sourceIds: ['*'],
                            eventTypes: ['*'],
                        },
                    ],
                };
                console.log('Sending addSubscription command:', addSubscriptionMessage);
                this.ws.send(JSON.stringify(addSubscriptionMessage));
            } else {
                this.handleMilestoneEvents(parsedData);
            }
        });

        this.ws.on('error', (error) => {
            console.error('Milestone WebSocket error:', error.message);
        });

        this.ws.on('close', (code, reason) => {
            console.log(`Milestone WebSocket connection closed: ${code} - ${reason}`);
            this.isConnected = false;
        });
    }

    // Handle the received events from Milestone WebSocket
    handleMilestoneEvents(message) {
        const { events } = message;

        if (Array.isArray(events)) {
            events.forEach((event) => {
                const { source, type, time } = event;
                if (event.data) {
                    console.log("event data:", event.data);
                }

                if (source.startsWith('cameras')) {
                    this.handleCameraEvent(event); // Handle camera events
                } else if (source.startsWith('userDefinedEvents')) {
                    this.handleAlarmEvent(event); // Handle alarm events
                }
            });
        }
    }

    // Handle raw camera events and broadcast them
    handleCameraEvent(event) {
        const formattedMessage = this.processMilestoneMessage(event);
        if (formattedMessage) {
            socketManager.emit('camera-events', formattedMessage); // Raw broadcast for camera events
        }
    }

    // Handle alarm events and pass them to the alarm manager for processing
    handleAlarmEvent(event) {
            alarmManager.onNewActiveAlarmEvent(event); // Let the Alarm Manager handle alarm events
    }


    // Helper function to process and format Milestone events
    processMilestoneMessage(event) {
        const { type, id, source, time } = event;

        // Find the matching event type in the cache
        const matchingEventType = this.eventTypes.find((et) => et.id === type);

        if (matchingEventType) {
            // Return formatted message
            return {
                id, // Event ID
                type, // Type ID
                displayName: matchingEventType.displayName, // Display name from cache
                source, // Event source
                time, // Event timestamp
            };
        }

        return null; // Return null if no matching eventType is found
    }
}

const instance = new MilestoneRealtimeClient();
module.exports = instance;