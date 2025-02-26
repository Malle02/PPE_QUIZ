const fs = require('fs');
const path = require('path');


const ca = fs.readFileSync(path.join(__dirname, '../certs/root/server.crt')).toString();
const key = fs.readFileSync(path.join(__dirname, '../certs/dbLoader/dbloader.key')).toString();
const cert = fs.readFileSync(path.join(__dirname, '../certs/dbLoader/dbloader.crt')).toString();

module.exports = {
  database: 'safe_building',
  username: 'dbloader',
  host: '192.168.1.26',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: ca,
      key: key,
      cert: cert,
    },
    useUTC: false, // ✅ Stops Sequelize from converting timestamps to UTC
  },
};