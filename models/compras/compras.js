module.exports = (sequelize, Sequelize) => {
    const Compra = sequelize.define("compras", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        // cliente: {
        //     type: Sequelize.FLOAT,
        //     allowNull: false,
        // },
        precioTotal: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
    });
    return Compra;
};