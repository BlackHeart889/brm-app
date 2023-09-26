const {Validator} = require('node-input-validator');
const db = require('../../models');
const Producto = db.producto;

exports.allProducts = async (req, res) => {
    try {  
        const productos = await Producto.findAll();

        return res.status(200).send({
            productos,
        });
        
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

exports.showProduct = async (req, res) => {
    try {  
        const v = new Validator(req.params, {
            id: 'required|integer',
        });
        
        v.check().then(async (matched) => {
            if (!matched) {
                return res.status(400).send(v.errors);
            } else{
                const producto = await Producto.findOne({
                    where: {
                        id: req.params.id,
                    },
                });

                if(!producto){
                    return res.status(404).send({
                        message: "El producto solicitado no existe.",
                    });
                } else{
                    return res.status(200).send({
                        producto,
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


exports.newProduct = async (req, res) => {
    //Crear un nuevo produccto
    try {
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
                const producto = await Producto.create({
                    numeroLote: req.body.numeroLote,
                    nombre: req.body.nombre,
                    precio: req.body.precio,
                    cantidadDisponible: req.body.cantidadDisponible,
                    fechaIngreso: req.body.fechaIngreso,
                });
                return res.status(200).send({
                    message: "Producto creado correctamente.",
                    id: producto.id,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
exports.updateProduct = (req, res) => {
    try {
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
                        const affectedRows = await Producto.update(data, {
                            where: {
                                id: req.params.id
                            },
                        });
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
                    }
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};

exports.deleteProduct = (req, res) => {
    try {
        const v = new Validator(req.params, {
            id: 'required|integer',
        });

        v.check().then(async (matched) => {
            if (!matched) {
                return res.status(400).send(v.errors);
            } else{
                const affectedRows = await Producto.destroy({
                    where: {
                        id: req.params.id
                    },
                });
                if(affectedRows[0] === 0){
                    return res.status(404).send({
                        message: "El producto no existe.",
                        affectedRows: affectedRows[0],
                    });
                } else{
                    return res.status(200).send({
                        message: "Producto eliminado correctamente.",
                        affectedRows: affectedRows[0],
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
