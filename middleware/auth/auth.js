const jwt = require("jsonwebtoken");
const config = require('../../config/auth.js');
const db = require('../../models');
const User = db.user;
const Role = db.role;

exports.verifyToken =  (req, res, next) => {
    let token = req.session.token;

    if(!token){
        return res.status(400).send({
            message: "Debe inciar sesión para acceder a este recurso.",
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if(err){
            return res.status(401).send({
                message: "No autorizado"
            });
        }
        req.userId = decoded.id;
        next();
    });
};

exports.isAdministrador = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        // const role = await Role.findByPk(user.roleId);

        if(user.roleId === 1){
            return next();
        } else{
            return res.status(403).send({
                message: "Debe ser administrador para realizar esta acción"
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "Error al validar el rol del usuario"
        });
    }
},

exports.isCliente = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        // const role = await Role.findByPk(user.roleId);

        if(user.roleId === 2){
            return next();
        } else{
            return res.status(403).send({
                message: "Debe ser cliente para realizar esta acción"
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "Error al validar el rol del usuario"
        });
    }
}
