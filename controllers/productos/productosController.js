const {Validator} = require('node-input-validator');
const logger = require('../../config/logging');
const db = require('../../models');
const Producto = db.producto;
const service = "productos-service";

/**
 * @api {get} /api/products Listado de Productos
 * @apiName allProducts
 * @apiGroup Productos
 *
 * @apiSuccess {Array} productos Listado de productos.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "productos": [
 *               {
 *                   "id": 3,
 *                   "numeroLote": "15526",
 *                   "nombre": "Producto 1",
 *                   "precio": 2000,
 *                   "cantidadDisponible": 15,
 *                   "fechaIngreso": "2023-12-02T00:00:00.000Z",
 *                   "createdAt": "2023-09-27T06:53:31.088Z",
 *                   "updatedAt": "2023-09-27T06:53:31.088Z"
 *               }
 *           ]
 *      }
 *
 * @apiError SinProductos No hay productos registrados.
 * @apiErrorExample {json} SinProductos:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "SinProductos"
 *     }
 * 
 * @apiError ErrorListandoProductos Ocurrió un error al listar los productos registrados.
 * @apiErrorExample {json} ErrorListandoProductos:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorListandoProductos"
 *     }
 * 
 */

exports.allProducts = async (req, res) => {
    Producto.findAll().then(productos => {
        if(productos.length === 0){
            return res.status(404).send({
                error: "SinProductos",
            });
        } else{
            return res.status(200).send({
                productos,
            });
        }
    }).catch(error => {
        return logger.logError('ErrorListandoProductos', service, error, res)
    });
}

/**
 * @api {get} /api/products/:id Detalles de Producto
 * @apiName showProduct
 * @apiGroup Productos
 *
 * @apiParam {Integer} id ID del producto
 * @apiParamExample Params:
 *     /api/products/5
 * 
 * @apiSuccess {Array} productos Listado de productos.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "productos": [
 *               {
 *                   "id": 3,
 *                   "numeroLote": "15526",
 *                   "nombre": "Producto 1",
 *                   "precio": 2000,
 *                   "cantidadDisponible": 15,
 *                   "fechaIngreso": "2023-12-02T00:00:00.000Z",
 *                   "createdAt": "2023-09-27T06:53:31.088Z",
 *                   "updatedAt": "2023-09-27T06:53:31.088Z"
 *               }
 *           ]
 *      }
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
 * @apiError SinProductos No hay productos registrados.
 * @apiErrorExample {json} SinProductos:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "SinProductos"
 *     }
 * 
 * @apiError ErrorListandoProductos Ocurrió un error al listar los productos registrados.
 * @apiErrorExample {json} ErrorListandoProductos:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorListandoProductos"
 *     }
 * 
 */
exports.showProduct = async (req, res) => {
    const v = new Validator(req.params, {
        id: 'required|integer',
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            Producto.findOne({
                where: {
                    id: req.params.id,
                },
            }).then(producto => {
                if(!producto){
                    return res.status(404).send({
                        message: "El producto solicitado no existe.",
                    });
                } else{
                    return res.status(200).send({
                        producto,
                    });
                }
            }).catch(error => {
                return logger.logError('Error al consultar los detalles del producto', service, error, res)
            });
        }
    });
};

/**
 * @api {post} /api/products/new-product Crear Producto
 * @apiName newProduct
 * @apiGroup Productos
 *
 * @apiBody {Numeric} numeroLote Número de lote del producto
 * @apiBody {String} nombre Nombre del producto
 * @apiBody {Numeric} precio Precio del producto
 * @apiBody {Integer} cantidadDisponible Número de existencias del producto
 * @apiBody {Date} fechaIngreso Fecha de ingreso del producto
 * 
 * @apiParamExample {json} Body:
 *   {
 *       "numeroLote": 1234,
 *       "nombre": "Producto 1",
 *       "precio": 15000,
 *       "cantidadDisponible": 10,
 *       "fechaIngreso": "2023-09-09",
 *   }

 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccess {Integer} id ID del producto creado.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Producto creado con éxito.",
 *          "id": 6
 *      }
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "id": {
 *              "message": "El campo nombre es obligatorio.",
 *              "rule": "required"
 *          }
 *     }
 * 
 * @apiError ErrorCreandoProducto Ocurrió un error al crear el producto.
 * @apiErrorExample {json} ErrorCreandoProducto:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorCreandoProducto"
 *     }
 * 
 */

exports.newProduct = async (req, res) => {
    //Crear un nuevo producto
    const v = new Validator(req.body, {
        numeroLote: 'required|numeric|min:0|digitsBetween:1,15',
        nombre: 'required|string|maxLength:50',
        precio: 'required|numeric|min:1|digitsBetween:1,15',
        cantidadDisponible: 'required|integer|min:0',
        fechaIngreso: 'required|dateFormat:YYYY-MM-DD',
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            Producto.create({
                numeroLote: req.body.numeroLote,
                nombre: req.body.nombre,
                precio: req.body.precio,
                cantidadDisponible: req.body.cantidadDisponible,
                fechaIngreso: req.body.fechaIngreso,
            }).then(producto => {
                return res.status(200).send({
                    message: "Producto creado con éxito.",
                    id: producto.id,
                })
            }).catch(error => {
                return logger.logError('ErrorCreandoProducto', service, error, res)
            });
        }
    });
};

/**
 * @api {patch} /api/products/update-product/:id Actualizar Producto
 * @apiName updateProduct
 * @apiGroup Productos
 * @apiParam {Integer} id ID del producto
 * @apiBody {Numeric} [numeroLote] Número de lote del producto
 * @apiBody {String} [nombre] Nombre del producto
 * @apiBody {Numeric} [precio] Precio del producto
 * @apiBody {Integer} [cantidadDisponible] Número de existencias del producto
 * @apiBody {Date} [fechaIngreso] Fecha de ingreso del producto
 * 
 * @apiParamExample Params:
 *     /api/products/update-product/5
 * 
 * @apiParamExample {json} Body:
 *   {
 *       "precio": 15000,
 *   }
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccess {Integer} affectedRows Número de registros actualizados.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Producto actualizado con éxito.",
 *          "affectedRow": 1
 *      }
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "cantidadDisponible": {
 *              "message": "El campo cantidad disponible debe ser de tipo entero",
 *              "rule": "integer"
 *          }
 *     }
 * @apiError ProductoNoExisteONoEnvioCampos El producto no existe o no especificó los campos a actualizar.
 * @apiErrorExample {json} ProductoNoExisteONoEnvioCampos:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "error": "ProductoNoExisteONoEnvioCampos",
 *          "affectedRows": 0
 *     }
 * 
 * @apiError ErrorActualizandoProducto Ocurrió un error al actualizar el producto.
 * @apiErrorExample {json} ErrorActualizandoProducto:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorActualizandoProducto"
 *     }
 * 
 */
exports.updateProduct = (req, res) => {
    const vParams = new Validator(req.params, {
        id: 'required|integer',
    });

    vParams.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(vParams.errors);
        } else{
            const v = new Validator(req.body, {
                numeroLote: 'numeric|min:0|digitsBetween:1,15',
                nombre: 'maxLength:50',
                precio: 'numeric|min:1|digitsBetween:1,15',
                cantidadDisponible: 'integer|min:0',
                fechaIngreso: 'dateFormat:YYYY-MM-DD',
            });
            
            v.check().then(async (matched) => {
                if (!matched) {
                    return res.status(400).send(v.errors);
                } else{
                    data = req.body;
                    Producto.update(data, {
                        where: {
                            id: req.params.id
                        },
                    }).then(affectedRows => {
                        if(affectedRows[0] === 0){
                            return res.status(404).send({
                                error: "ProductoNoExisteONoEnvioCampos",
                                affectedRows: affectedRows[0],
                            });
                        } else{
                            return res.status(200).send({
                                message: "Producto actualizado con éxito.",
                                affectedRows: affectedRows[0],
                            });
                        }
                    }).catch(error => {
                        return logger.logError('ErrorActualizandoProducto', service, error, res)
                    });
                }
            });
        }
    });
};

/**
 * @api {delete} /api/products/delete-product/:id Eliminar Producto
 * @apiName deleteProduct
 * @apiGroup Productos
 *
 * @apiParam {Integer} id ID del producto
 * 
 * @apiParamExample Params:
 *     /api/products/delete-product/5
 * 
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccess {Integer} affectedRows Número de registros actualizados.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Producto eliminado con éxito.",
 *          "affectedRow": 1
 *      }
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "id": {
 *              "message": "El campo id es obligatorio",
 *              "rule": "required"
 *          }
 *     }
 * 
 * @apiError ProductoNoExiste El producto no existe.
 * @apiErrorExample {json} ProductoNoExiste:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "error": "ProductoNoExiste",
 *          "affectedRows": 0
 *     }
 * 
 * @apiError ErrorEliminandoProducto Ocurrió un error al actualizar el producto, posiblemente violación de llaves foráneas.
 * @apiErrorExample {json} ErrorEliminandoProducto:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorEliminandoProducto"
 *     }
 */
exports.deleteProduct = (req, res) => {
    const v = new Validator(req.params, {
        id: 'required|integer',
    });

    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            Producto.destroy({
                where: {
                    id: req.params.id
                },
            }).then(result => {
                if(result === 0){
                    return res.status(404).send({
                        error: "ProductoNoExiste",
                        affectedRows: result[0],
                    });
                } else{
                    return res.status(200).send({
                        message: "Producto eliminado con éxito.",
                        affectedRows: result[0],
                    });
                }
            }).catch(error => {
                return logger.logError('ErrorEliminandoProducto', service, error, res)       
            });
        }
    });
};
