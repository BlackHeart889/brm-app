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
db.role.hasMany(db.user, {onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
db.user.belongsTo(db.role, {onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});

db.producto = require('../models/productos/producto.js')(sequelize, Sequelize);
db.compra = require('../models/compras/compras.js')(sequelize, Sequelize);
db.user.hasMany(db.compra, {foreignKey: "cliente", onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
db.compra.belongsTo(db.user, {foreignKey: "cliente", onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});

db.compraProducto = require('./compras/compraProducto.js')(sequelize, Sequelize);
db.compra.belongsToMany(db.producto, {through: {model: db.compraProducto, unique: false}, foreignKey: 'idCompra', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
db.producto.belongsToMany(db.compra, {through: {model: db.compraProducto, unique: false}, foreignKey: 'idProducto', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
module.exports = db;