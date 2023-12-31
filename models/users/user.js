module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        primerNombre: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        primerApellido: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        username: {
            type: Sequelize.STRING(15),
            unique: true,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(40),
            unique: true,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    });
    return User;
};