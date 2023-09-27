const {Validator} = require('node-input-validator');
const logger = require('../../config/logging');
const db = require('../../models');
const User = db.user;
const Producto = db.producto;
const Compra = db.compra;
const CompraProducto = db.compraProducto;

const service = "compras-service";

/**
 * @api {post} /api/purchases/buy Comprar Productos
 * @apiName comprarProductos
 * @apiGroup Compras
 *
 * @apiBody {Array} productos Listado de productos
 * @apiBody {Integer} id ID de producto
 * @apiBody {Integer} unidades Cantidad de productos
 * 
 * @apiParamExample {json} Body:
 *   {
 *       "productos": [
 *          {
 *              "id": 1,
 *              "unidades": 5
 *          },
 *          {
 *              "id": 2,
 *              "unidades": 1
 *          }
 *       ]
 *   }

 * @apiSuccess {String} message Mensaje de confirmación.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Compra realizada con éxito.",
 *      }
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "producto": {
 *              "message": "El campo producto debe ser de tipo array.",
 *              "rule": "array"
 *          }
 *     }
 * 
 * @apiError UnidadesInsuficientes El número de unidades disponibles es inferior al numero de unidades por comprar.
 * @apiErrorExample {json} UnidadesInsuficientes:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "error": "UnidadesInsuficientes",
 *          "idProducto": 5
 *     }
 * 
 * @apiError ProductosInvalidos No se encontraron uno o más productos con los ID suministrados.
 * @apiErrorExample {json} ProductosInvalidos:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "error": "ProductosInvalidos",
 *          "idProducto": 5
 *     }
 * 
 * @apiError ErrorActualizandoExistencias Ocurrió un error al actualizar unidades disponibles.
 * @apiErrorExample {json} ErrorActualizandoExistencias:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorActualizandoExistencias"
 *     }
 * 
 * @apiError ErrorRegistrandoCompra Ocurrió un error al registrar la compra del producto.
 * @apiErrorExample {json} ErrorRegistrandoCompra:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorRegistrandoCompra"
 *     }
 * 
 * @apiError ErrorValidandoProducto Ocurrió un error al validar el producto.
 * @apiErrorExample {json} ErrorValidandoProducto:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorValidandoProducto"
 *     }
 * 
 * @apiError ErrorAlComprarProductos Ocurrió un error al comprar los productos.
 * @apiErrorExample {json} ErrorAlComprarProductos:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorAlComprarProductos"
 *     }
 * 
 */

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
                                    return logger.logError('ErrorActualizandoExistencias', service, error, res)
                                });
                            }).catch(async error => {
                                await t.rollback();
                                return logger.logError('ErrorRegistrandoCompra', service, error, res)
                            });
                        } else{
                            await t.rollback();
                            return res.status(400).send({
                                error: "UnidadesInsuficientes",
                                idProducto: producto.id,
                            });
                        }
                    } else{
                        await t.rollback();
                        return res.status(400).send({
                            error: "ProductosInvalidos.",
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
            return await compra.save({ transaction: t }).then(async () => {
                await t.commit();
                return res.status(200).send({
                    message: "Compra realizada con éxito.",
                });
            }).catch(error => {
                return logger.logError('ErrorAlComprarProductos', service, error, res)
            });
        }
    });
};

/**
 * @api {get} /api/purchases/details/:id Detalles Compra
 * @apiName showFacturaCompra
 * @apiGroup Compras
 *
 * @apiParam {Integer} id ID de la compra
 * 
 * @apiParamExample Params:
 *   /api/purchases/details/5
 * 
 * @apiSuccess {Object} compra Compra realizada.
 * @apiSuccess {Integer} id ID de la compra.
 * @apiSuccess {Numeric} precioTotal: Precio total de la compra.
 * @apiSuccess {Date} fechaCompra Fecha de la compra.
 * @apiSuccess {Object} productos Productos comprados.
 * @apiSuccess {String} nombre Nombre del producto comprado.
 * @apiSuccess {Object} detalles Detalles de la compra del producto.
 * @apiSuccess {Integer} unidades Unidades compradas del producto.
 * @apiSuccess {Numeric} precioUnidad Precio al cual se compró el producto.
 * 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "compra": {
 *            "id": 108,
 *            "precioTotal": 22500,
 *            "fechaCompra": "2023-09-27T06:17:42.881Z",
 *            "productos": [
 *                {
 *                    "nombre": "Producto 1",
 *                    "detalles": {
 *                        "unidades": 3,
 *                        "precioUnidad": 5500
 *                    }
 *                },
 *                {
 *                    "nombre": "Producto 2",
 *                    "detalles": {
 *                        "unidades": 3,
 *                        "precioUnidad": 2000
 *                    }
 *                }
 *            ]
 *        }
 *    } 
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "id": {
 *              "message": "El campo id es obligatorio.",
 *              "rule": "required"
 *          }
 *     }
 * 
 * @apiError CompraNoExiste La compra no existe.
 * @apiErrorExample {json} CompraNoExiste:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "error": "CompraNoExiste",
 *     }
 * 
 * @apiError ErrorAlConsultarDetallesCompra Ocurrió un error al consultar los detalles de la compra.
 * @apiErrorExample {json} ErrorAlConsultarDetallesCompra:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *          "error": "ErrorAlConsultarDetallesCompra"
 *     }
 * 
 */
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
                        error: "CompraNoExiste",
                    });
                } else{
                    return res.status(200).send({
                        compra,
                    });
                }
            }).catch(error => {
                return logger.logError( 'ErrorAlConsultarDetallesCompra', service, error, res)
            });
        }
    });
};

/**
 * @api {get} /api/purchases Historial de Compras
 * @apiName showHistorialCompras
 * @apiGroup Compras
 *
 * @apiSuccess {Array} productos Lista de productos.
 * @apiSuccess {String} nombre Nombre del producto.
 * @apiSuccess {Array} compras Lista de compras del producto.
 * @apiSuccess {Date} fechaCompra Fecha de compra del producto.
 * @apiSuccess {Object} detallesCompra Detalles de la compra del producto.
 * @apiSuccess {Integer} unidades Unidades compradas del producto.
 * @apiSuccess {Numeric} precioUnidad Precio por unidad comprada del producto.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "productos": [
 *             {
 *                 "nombre": "Producto 1",
 *                 "compras": [
 *                     {
 *                         "fechaCompra": "2023-09-27T09:19:51.134Z",
 *                         "detallesCompra": {
 *                             "unidades": 3,
 *                             "precioUnidad": 2000
 *                         }
 *                     },
 *                     {
 *                         "fechaCompra": "2023-09-27T09:20:48.068Z",
 *                         "detallesCompra": {
 *                             "unidades": 10,
 *                             "precioUnidad": 2000
 *                         }
 *                     },
 *                     {
 *                         "fechaCompra": "2023-09-27T09:22:03.085Z",
 *                         "detallesCompra": {
 *                             "unidades": 2,
 *                             "precioUnidad": 2000
 *                         }
 *                     }
 *                 ]
 *             },
 *             {
 *                "nombre": "Producto 3",
 *                 "compras": [
 *                     {
 *                         "fechaCompra": "2023-09-27T09:19:51.134Z",
 *                         "detallesCompra": {
 *                             "unidades": 3,
 *                             "precioUnidad": 15000
 *                         }
 *                     },
 *                     {
 *                         "fechaCompra": "2023-09-27T09:20:48.068Z",
 *                         "detallesCompra": {
 *                             "unidades": 12,
 *                             "precioUnidad": 15000
 *                         }
 *                     }
 *                 ]
 *             }
 *         ]
 *     }
 * 
 * 
 * @apiError NoHaRealizadoCompras No hay compras registradas en el sistema.
 * @apiErrorExample {json} NoHaRealizadoCompras:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "error": "NoHaRealizadoCompras",
 *     }
 * 
 * @apiError ErrorAlConsultarCompras Ocurrió un error al consultar las compras realizadas.
 * @apiErrorExample {json} ErrorAlConsultarCompras:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *          "error": "ErrorAlConsultarCompras"
 *     }
 * 
 */
exports.showHistorialCompras = async (req, res) => {
    Producto.findAll({
        attributes: ['nombre'],
        include: {
            attributes: [["createdAt", "fechaCompra"]],
            model: Compra,
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
                error: "NoHaRealizadoCompras",
            });
        } else{
            return res.status(200).send({
                productos,
            });
        }
    }).catch(error => {
        return logger.logError('ErrorAlConsultarCompras', service, error, res)
    });
};

/**
 * @api {get} /api/purchases/all Todas las Compras
 * @apiName showTodasLasCompras
 * @apiGroup Compras
 *
 * @apiSuccess {Array} compras Lista de compras.
 * @apiSuccess {Integer} id ID de la compra.
 * @apiSuccess {Numeric} precioTotal: Precio total de la compra.
 * @apiSuccess {Date} fechaCompra Fecha de compra del producto.
 * @apiSuccess {Object} user Usuario que realizó la compra.
 * @apiSuccess {String} primerNombre Primer nombre del usuario que realizó la compra
 * @apiSuccess {String} primerApellido Primer apellido que realizó la compra
 * @apiSuccess {String} email Correo electrónico del usuario que realizó la compra
 * @apiSuccess {String} nombre Nombre del producto.
 * @apiSuccess {Array} productos Lista de productos comprados.
 * @apiSuccess {Object} detallesCompra Detalles de la compra del producto.
 * @apiSuccess {Integer} unidades Unidades compradas del producto.
 * @apiSuccess {Numeric} precioUnidad Precio por unidad comprada del producto.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "compras": [
 *               {
 *                   "id": 2,
 *                   "precioTotal": 51000,
 *                   "fechaCompra": "2023-09-27T09:19:51.134Z",
 *                   "user": {
 *                       "id": 4,
 *                       "primerNombre": "Cristhian",
 *                       "primerApellido": "Monrroy",
 *                       "email": "monrroy3@gmail.com"
 *                   },
 *                   "productos": [
 *                       {
 *                           "nombre": "Producto 1",
 *                           "detallesCompra": {
 *                               "unidades": 3,
 *                               "precioUnidad": 2000
 *                           }
 *                       },
 *                       {
 *                           "nombre": "Producto 3",
 *                           "detallesCompra": {
 *                               "unidades": 3,
 *                               "precioUnidad": 15000
 *                           }
 *                       }
 *                   ]
 *               },
 *               {
 *                   "id": 4,
 *                   "precioTotal": 200000,
 *                   "fechaCompra": "2023-09-27T09:20:48.068Z",
 *                   "user": {
 *                       "id": 4,
 *                       "primerNombre": "Cristhian",
 *                       "primerApellido": "Monrroy",
 *                       "email": "monrroy3@gmail.com"
 *                   },
 *                   "productos": [
 *                       {
 *                           "nombre": "Producto 1",
 *                           "detallesCompra": {
 *                               "unidades": 10,
 *                               "precioUnidad": 2000
 *                           }
 *                       },
 *                       {
 *                           "nombre": "Producto 3",
 *                           "detallesCompra": {
 *                               "unidades": 12,
 *                               "precioUnidad": 15000
 *                           }
 *                       }
 *                   ]
 *               },
 *               {
 *                   "id": 6,
 *                   "precioTotal": 4000,
 *                   "fechaCompra": "2023-09-27T09:22:03.085Z",
 *                   "user": {
 *                       "id": 4,
 *                       "primerNombre": "Cristhian",
 *                       "primerApellido": "Monrroy",
 *                       "email": "monrroy3@gmail.com"
 *                   },
 *                   "productos": [
 *                       {
 *                           "nombre": "Producto 1",
 *                           "detallesCompra": {
 *                               "unidades": 2,
 *                               "precioUnidad": 2000
 *                           }
 *                       }
 *                   ]
 *               }
 *           ]
 *       }
 * 
 * @apiError NoHayCompras No hay compras registradas en el sistema.
 * @apiErrorExample {json} NoHayCompras:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "error": "NoHayCompras",
 *     }
 * 
 * @apiError ErrorAlConsultarCompras Ocurrió un error al consultar todas las compras realizadas.
 * @apiErrorExample {json} ErrorAlConsultarCompras:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *          "error": "ErrorAlConsultarCompras"
 *     }
 * 
 */

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
                message: "NoHayCompras",
            });
        } else{
            return res.status(200).send({
                compras,
            });
        }
    }).catch(error => {
        return logger.logError(ErrorAlConsultarCompras, service, error, res)

    });
};