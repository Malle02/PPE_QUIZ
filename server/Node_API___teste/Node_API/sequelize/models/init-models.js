var DataTypes = require("sequelize").DataTypes;
var _alarm_category = require("./alarm_category");
var _alarm_priority = require("./alarm_priority");
var _alarm_state = require("./alarm_state");
var _camera = require("./camera");
var _operator = require("./operator");
var _ptz_settings = require("./ptz_settings");
var _recorder = require("./recorder");
var _report = require("./report");
var _video_alarm = require("./video_alarm");
var _video_alarm_definition = require("./video_alarm_definition");

function initModels(sequelize) {
  var alarm_category = _alarm_category(sequelize, DataTypes);
  var alarm_priority = _alarm_priority(sequelize, DataTypes);
  var alarm_state = _alarm_state(sequelize, DataTypes);
  var camera = _camera(sequelize, DataTypes);
  var operator = _operator(sequelize, DataTypes);
  var ptz_settings = _ptz_settings(sequelize, DataTypes);
  var recorder = _recorder(sequelize, DataTypes);
  var report = _report(sequelize, DataTypes);
  var video_alarm = _video_alarm(sequelize, DataTypes);
  var video_alarm_definition = _video_alarm_definition(sequelize, DataTypes);

  // Making associations to indicate foreign keys, which is vital for joins
  camera.hasOne(ptz_settings, { foreignKey: 'camera_id' });
  ptz_settings.belongsTo(camera, { foreignKey: 'camera_id' });

  video_alarm_definition.hasMany(video_alarm, {
    foreignKey: 'alarm_definition_id',
    as: 'video_alarms',  // Alias used to refer to the related video_alarms
  });

  video_alarm.belongsTo(video_alarm_definition, {
    foreignKey: 'alarm_definition_id',
    as: 'alarm_definition',  // Alias for the associated video_alarm_definition
  });




  return {
    alarm_category,
    alarm_priority,
    alarm_state,
    camera,
    operator,
    ptz_settings,
    recorder,
    report,
    video_alarm,
    video_alarm_definition,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
