const {Validator} = require('node-input-validator');
const logger = require('../../config/logging');
const db = require('../../models');
const Producto = db.producto;

const service = "productos-service";
exports.allProducts = async (req, res) => {
    Producto.findAll().then(productos => {
        if(productos.length === 0){
            return res.status(404).send({
                message: "No hay productos para mostrar.",
            });
        } else{
            return res.status(200).send({
                productos,
            });
        }
    }).catch(error => {
        return logger.logError('Error al listar los productos', service, error, res)
    });
}

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


exports.newProduct = async (req, res) => {
    //Crear un nuevo producto
    const v = new Validator(req.body, {
        numeroLote: 'required|numeric|min:0|digitsBetween:1,15',
        nombre: 'required|maxLength:50',
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
                    message: "Producto creado correctamente.",
                    id: producto.id,
                })
            }).catch(error => {
                return logger.logError('Error al crear el producto', service, error, res)
            });
        }
    });
};
exports.updateProduct = (req, res) => {
    const vParams = new Validator(req.params, {
        id: 'required|integer',
    });

    vParams.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(vParams.errors);
        } else{
            const v = new Validator(req.body, {
                // id: 'required|integer',
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
                    // delete data['id'];
                    Producto.update(data, {
                        where: {
                            id: req.params.id
                        },
                    }).then(affectedRows => {
                        if(affectedRows[0] === 0){
                            return res.status(404).send({
                                message: "El producto no existe o no especificó los campos a actualizar.",
                                affectedRows: affectedRows[0],
                            });
                        } else{
                            return res.status(200).send({
                                message: "Producto actualizado correctamente.",
                                affectedRows: affectedRows[0],
                            });
                        }
                    }).catch(error => {
                        return logger.logError('Error al actualizar el producto', service, error, res)
                    });
                }
            });
        }
    });
};

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
                        message: "El producto no existe.",
                        affectedRows: result[0],
                    });
                } else{
                    return res.status(200).send({
                        message: "Producto eliminado correctamente.",
                        affectedRows: result[0],
                    });
                }
            }).catch(error => {
                return logger.logError('Error al eliminar el producto.', service, error, res)       
            });
        }
    });
};
