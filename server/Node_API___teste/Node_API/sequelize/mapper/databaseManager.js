const initModels = require("../models/init-models"); // Auto-generated models
const { clients_channel, dbLoader_channel} = require("../config/db_config");

class DatabaseManager {
  constructor() {
    if (!DatabaseManager.instance) {
      this.init();
      DatabaseManager.instance = this;
    }
    return DatabaseManager.instance;
  }

  init() {
    // Bind models to both DB instances
    this.clients_channel = initModels(clients_channel);
    this.dbLoader_channel = initModels(dbLoader_channel);
  }

  async authenticate() {
    try {
      await clients_channel.authenticate();
      console.log("clients database channel established!");

      await dbLoader_channel.authenticate();
      console.log("dbLoader database channel established!");

    } catch (error) {
      console.error("Database connection failed:", error);
    }
  }

  // Get models bound to the clients database
  getClientsDB() {
    return this.clients_channel;
  }

  // Get the sequelize instance directly to be able to summon raw queries
  // WARNING: only use it when the query doesn't involve string injection (no injection or at least easily checkable type like int or uuid)
  getClientsDBForRawQueries() {
    return clients_channel;
  }

  // Get models bound to the dbLoader database
  getDbLoaderDB() {
    return this.dbLoader_channel;
  }
}

// Test only to bypass self-signed certificate error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Export the singleton instance
const dbManager = new DatabaseManager();
dbManager.authenticate(); // Authenticate on startup

module.exports = dbManager;
