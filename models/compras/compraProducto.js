module.exports = (sequelize, Sequelize) => {
    const CompraProducto = sequelize.define("comprasproductos", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        unidades: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        precioUnidad: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    });
    return CompraProducto;
};