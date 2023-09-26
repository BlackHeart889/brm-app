const rolesSeeder = require('../seeders/roles');

exports.seed  =  async (db) => {
    await rolesSeeder.init(db.role);
}