const { Sequelize } = require('sequelize');
const dbLoader_config = require('./dbLoader_config');
const clients_config = require('./clients_config');

const dbLoader_channel = new Sequelize(dbLoader_config.database, dbLoader_config.username, dbLoader_config.password, {
  host: dbLoader_config.host,
  dialect: dbLoader_config.dialect,
  dialectOptions: dbLoader_config.dialectOptions,
  timezone: 'Etc/UTC',
  pool: {
    max: 10,              // Maximum number of connections in the pool
    min: 0,               // Minimum number of connections in the pool
    acquire: 30000,       // Maximum time (in ms) to wait for a connection before throwing an error
    idle: 10000           // Maximum time (in ms) a connection can be idle before being released
  }
});

const clients_channel = new Sequelize(clients_config.database, clients_config.username, clients_config.password, {
  host: clients_config.host,
  dialect: clients_config.dialect,
  timezone: 'Etc/UTC',
  dialectOptions: clients_config.dialectOptions,
  pool: {
    max: 10,              // Maximum number of connections in the pool
    min: 0,               // Minimum number of connections in the pool
    acquire: 30000,       // Maximum time (in ms) to wait for a connection before throwing an error
    idle: 10000           // Maximum time (in ms) a connection can be idle before being released
  }
});

module.exports = {
    dbLoader_channel,
    clients_channel,
};

