const { Server } = require('socket.io');

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.io = null;
      this.alarmManager = null;
      this.CHANNELS = {
        ALARM_EVENTS: 'alarm-events',
        CAMERA_EVENTS: 'camera-events',
      };
      
      this.OPERATIONS = {
        ACTIVE_ALARMS_LIST: "active_alarms_list",
        ALARM_UPDATE: "alarm_update",
      };

      SocketManager.instance = this;
    }
    return SocketManager.instance;
  }

  init(server, alarmManager) {
    if (this.io) {
      console.warn("SocketManager is already initialized.");
      return;
    }

    this.io = new Server(server, {
      path: '/realtimeEvents',
      cors: { origin: "*" },
    });

    this.alarmManager = alarmManager;  // Now passing alarmManager through init
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.handshake.address);

      socket.on('message', async (msg) => {
        this.processMessage(socket, msg);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.handshake.address);
      });
    });
  }

  async processMessage(socket, msg) {
    switch (msg.op) {
      case this.OPERATIONS.ACTIVE_ALARMS_LIST:
        const activeAlarms = this.alarmManager.getActiveAlarms();  // Use alarmManager
        socket.emit(this.CHANNELS.ALARM_EVENTS, {
          op: this.OPERATIONS.ACTIVE_ALARMS_LIST,
          data: activeAlarms,
        });
        break;

      case this.OPERATIONS.ALARM_UPDATE:
        await this.handleUpdateAlarm(socket, msg);
        break;

      default:
        socket.emit(this.CHANNELS.ALARM_EVENTS, {
          op: "error",
          message: "Unknown operation.",
          available_operations: Object.values(this.OPERATIONS),
        });
    }
  }

  async handleUpdateAlarm(socket, msg) {
    const { alarmId, comment, priority, state } = msg;

    if (!alarmId || !comment || !priority || !state) {
      socket.emit(this.CHANNELS.ALARM_EVENTS, {
        op: this.OPERATIONS.ALARM_UPDATE,
        error: "Missing required fields: alarmId, comment, priority, state",
      });
      return;
    }

    try {
      const updatedAlarm = await this.alarmManager.updateAlarm(alarmId, comment, priority, state);  // Use alarmManager
      this.io.emit(this.CHANNELS.ALARM_EVENTS, {
        op: this.OPERATIONS.ALARM_UPDATE,
        data: updatedAlarm,
      });
    } catch (error) {
      console.log(error);
      socket.emit(this.CHANNELS.ALARM_EVENTS, {
        op: this.OPERATIONS.ALARM_UPDATE,
        error: error.message,
      });
    }
  }

  emit(event, data) {
    if (!this.io) {
      console.error("SocketManager is not initialized. Call init(server) first.");
      return;
    }
    this.io.emit(event, data);
  }
}

const instance = new SocketManager();
module.exports = instance;
