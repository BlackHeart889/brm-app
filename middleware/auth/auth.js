const jwt = require("jsonwebtoken");
const config = require('../../config/auth.js');
const logger = require('../../config/logging');
const db = require('../../models');
const User = db.user;
const Role = db.role;

const service = "auth-middleware-service";

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
    User.findByPk(req.userId).then(user => {
        if(user){
            if(user.roleId === 1){
                return next();
            } else{
                return res.status(403).send({
                    message: "Debe ser administrador para realizar esta acción"
                });
            }
        } else{
            req.session.token = null;
            return res.status(403).send({
                message: "Su sesión ha expirado. Por favor, inicie sesión nuevamente."
            });
        }
    }).catch(error => {
        logger.logError('Error al validar el rol del usuario', service, error, res)
    });
},

exports.isCliente = async (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if(user){
            if(user.roleId === 2){
                return next();
            } else{
                return res.status(403).send({
                    message: "Debe ser cliente para realizar esta acción"
                });
            }
        } else{
            req.session.token = null;
            return res.status(403).send({
                message: "Su sesión ha expirado. Por favor, inicie sesión nuevamente."
            });
        }
    }).catch(error => {
        logger.logError('Error al validar el rol del usuario', service, error, res)
    });
}
