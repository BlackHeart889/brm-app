const {Validator} = require('node-input-validator');
const logger = require('../../config/logging');
const db = require('../../models');
const User = db.user;
const Producto = db.producto;
const Compra = db.compra;
const CompraProducto = db.compraProducto;

const service = "compras-service";
exports.comprarProductos = async (req, res) => {
    //Comprar productos
    const t = await db.sequelize.transaction();
    const v = new Validator(req.body, {
        'productos': 'required|array',
        'productos.*.id': 'required|integer',
        'productos.*.unidades': 'required|integer'
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            // await t.rollback();
            return res.status(400).send(v.errors);
        } else{
            const compra = await Compra.create({
                cliente: req.userId,
            }, { transaction: t });

            let totalCompra = 0;
            for (const producto of req.body.productos) {
                // console.log(producto.id);
                var result =  await Producto.findOne({
                    where: {
                        id: producto.id,
                    }
                }).then(async validProducto => {
                    if(validProducto){
                        if(producto.unidades <= validProducto.cantidadDisponible){
                            return await CompraProducto.create({
                                idProducto: producto.id,
                                unidades: producto.unidades,
                                precioUnidad: validProducto.precio,
                                idCompra: compra.id,
                            }, { transaction: t }).then(async () => {
                                return Producto.update({cantidadDisponible: validProducto.cantidadDisponible-producto.unidades},{
                                    where: {
                                        id: producto.id,
                                    },
                                    transaction: t
                                }).then(() => {
                                    totalCompra += validProducto.precio*producto.unidades;
                                }).catch(async error => {
                                    await t.rollback();
                                    return logger.logError('Error al registrar la compra del producto', service, error, res)
                                });
                            }).catch(async error => {
                                await t.rollback();
                                return logger.logError('Error al registrar la compra del producto', service, error, res)
                            });
                        } else{
                            await t.rollback();
                            return res.status(400).send({
                                message: "No hay suficientes unidades para la venta.",
                                idProducto: producto.id,
                            });
                        }
                    } else{
                        await t.rollback();
                        return res.status(400).send({
                            message: "Ingresó uno o mas productos inválidos.",
                            idProducto: producto.id,
                        });
                    }
                }).catch(async error => {
                    await t.rollback();
                    return logger.logError('Error al validar el producto', service, error, res)
                });
                if(result){
                    return result;
                }
            }

            compra.precioTotal = totalCompra;
            await compra.save({ transaction: t });
            await t.commit();
            return res.status(200).send({
                message: "Compra realizada correctamente.",
            });
        }
    });
};

exports.showFacturaCompra = (req, res) => {
    const v = new Validator(req.params, {
        id: 'required|integer',
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            Compra.findOne({
                attributes: [
                    'id', 'precioTotal', ['createdAt', 'fechaCompra']
                ],  
                where: {
                    id: req.params.id,
                    cliente: req.userId,
                },
                include: [{
                    model: Producto,
                    attributes: ["nombre"],
                    through:{
                        as: "detalles",
                        attributes: ["unidades", "precioUnidad"],
                    }
                }],
            }).then(compra => {
                if(!compra){
                    return res.status(404).send({
                        message: "La compra solicitada no existe.",
                    });
                } else{
                    return res.status(200).send({
                        compra,
                    });
                }
            }).catch(error => {
                return logger.logError( 'Error al consultar los detalles de la compra', service, error, res)
            });
        }
    });
};

exports.showHistorialCompras = async (req, res) => {
    Producto.findAll({
        attributes: ['nombre'],
        include: {
            attributes: [["createdAt", "fechaCompra"]],
            model: Compra,
            // as: "detallesCompra",
            where: {
                cliente: req.userId,
            },
            through: {
                as: "detallesCompra",
                attributes: ["unidades", "precioUnidad"],
            }
        },
    }).then(productos => {
        if(productos.length === 0){
            return res.status(404).send({
                message: "No ha realizado ninguna compra.",
            });
        } else{
            return res.status(200).send({
                productos,
            });
        }
    }).catch(error => {
        return logger.logError('Error al consultar el historial de compras.', service, error, res)
    });
};

exports.showTodasLasCompras = async (req, res) => {
    Compra.findAll({
        attributes: [
            'id', 'precioTotal', ['createdAt', 'fechaCompra']
        ],  
        include: [{
            model: User,
            attributes: ["id", "primerNombre", "primerApellido", "email"]
        },
        {
            model: Producto,
            attributes: ["nombre"],
            through:{
                as: "detallesCompra",
                attributes: ["unidades", "precioUnidad"],
            }
        }],
    }).then(compras => {
        // console.log(compras);
        if(compras.length === 0){
            return res.status(404).send({
                message: "No hay compras para mostrar.",
            });
        } else{
            return res.status(200).send({
                compras,
            });
        }
    }).catch(error => {
        return logger.logError('Error al consultar todas las compras', service, error, res)

    });
};