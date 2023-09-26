const config = require('../config/config.js');
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.acquire,
            idle: config.idle,
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require('../models/users/user.js')(sequelize, Sequelize);
db.role = require('../models/users/role.js')(sequelize, Sequelize);
db.role.hasMany(db.user);
db.user.belongsTo(db.role);

module.exports = db;