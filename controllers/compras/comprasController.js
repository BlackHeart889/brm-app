const {Validator} = require('node-input-validator');
const db = require('../../models');
const User = db.user;
const Producto = db.producto;
const Compra = db.compra;
const CompraProducto = db.compraProducto;

exports.comprarProductos = async (req, res) => {
    //Comprar productos
    const t = await db.sequelize.transaction();
    try {
        const v = new Validator(req.body, {
            'productos': 'required|array',
            'productos.*.id': 'required|integer',
            'productos.*.unidades': 'required|integer'
        });
        
        v.check().then(async (matched) => {
            if (!matched) {
                await t.rollback();
                return res.status(400).send(v.errors);
            } else{
                const compra = await Compra.create({
                    cliente: req.userId,
                }, { transaction: t });

                let totalCompra = 0;
                for (const producto of req.body.productos) {
                    const validProducto = await Producto.findOne({
                        where: {
                            id: producto.id,
                        }
                    });
                    if(validProducto){
                        if(producto.unidades <= validProducto.cantidadDisponible){
                            await CompraProducto.create({
                                idProducto: producto.id,
                                unidades: producto.unidades,
                                precioUnidad: validProducto.precio,
                                idCompra: compra.id,
                            }, { transaction: t });
                            const rows = await Producto.update({cantidadDisponible: validProducto.cantidadDisponible-producto.unidades},{
                                where: {
                                    id: producto.id,
                                }
                            }, { transaction: t });
                            totalCompra += validProducto.precio*producto.unidades;
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
                }
                compra.precioTotal = totalCompra;
                await compra.save({ transaction: t });
                // const rows = await Compra.update({
                //     precioTotal: totalCompra
                // },{
                //     where: {
                //         id: compra.id,
                //     }
                // }, { transaction: t });
                await t.commit();
                return res.status(200).send({
                    message: "Compra realizada correctamente.",
                });
            }
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).send({
            message: error.message
        });
    }
};

exports.showFacturaCompra = (req, res) => {
    try {  
        const v = new Validator(req.params, {
            id: 'required|integer',
        });
        
        v.check().then(async (matched) => {
            if (!matched) {
                return res.status(400).send(v.errors);
            } else{
                const compra = await Compra.findOne({
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
                });

                if(!compra){
                    return res.status(404).send({
                        message: "La compra solicitada no existe.",
                    });
                } else{
                    return res.status(200).send({
                        compra,
                    });
                }
            }
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};

exports.showHistorialCompras = async (req, res) => {
    try {  
        const productos = await Producto.findAll({
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
        });
        if(!productos){
            return res.status(404).send({
                message: "No ha realizado ninguna compra.",
            });
        } else{
            return res.status(200).send({
                productos,
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};

exports.showTodasLasCompras = async (req, res) => {
    try {  
        const compras = await Compra.findAll({
            attributes: [
                'id', 'precioTotal', ['createdAt', 'fechaCompra']
            ],  
            // where: {
            //     id: req.params.id,
            //     cliente: req.userId,
            // },
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
        });

        if(!compras){
            return res.status(404).send({
                message: "No hay compras para mostrar.",
            });
        } else{
            return res.status(200).send({
                compras,
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};