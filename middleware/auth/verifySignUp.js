const {Validator} = require('node-input-validator');
const db = require('../../models');
const logger = require('../../config/logging');
const Role = db.role;
const User = db.user;

const service = "verifySignUp-middleware-service";
exports.checkDuplicateUsernameorEmail = async (req, res, next) => {
    const v = new Validator(req.body, {
        username: 'required|string|maxLength:15',
        email: 'required|email',
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            User.findOne({
                where: {
                    username: req.body.username,
                },
            }).then(async user => {
                if(user) {
                    return res.status(400).send({
                        message: "El nombre de usuario ya está en uso",
                    });
                }
                User.findOne({
                    where: {
                        email: req.body.email,
                    },
                }).then(user => {
                    if(user) {
                        return res.status(400).send({
                            message: "El correo electrónico ya está en uso",
                        });
                    }
                    next();
                }).catch(error => {
                    logger.logError('Error al validar el usuario', service, error, res)
                });
            }).catch(error => {
                logger.logError('Error al validar el usuario', service, error, res)
            });
        }
    });
};

exports.checkRolesExisted = async (req, res, next) => {
    Role.findAll().then(roles => {
        if(req.body.roleId){
            let validRole = roles.some((role) => role.id === req.body.roleId);
            if(!validRole){
                return res.status(400).send({
                    message: "Rol invalido",
                });
            }
            next();
        } else{
            return res.status(400).send({
                message: "Debe suministrar un rol",
            });
        }
    }).catch(error => {
        logger.logError('Error al validar el rol', service, error, res)
    });
};

