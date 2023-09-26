module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define("productos", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        numeroLote: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        nombre: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        precio: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        cantidadDisponible: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        fechaIngreso: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    });
    return Producto;
};