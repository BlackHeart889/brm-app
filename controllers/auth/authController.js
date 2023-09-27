const {Validator} = require('node-input-validator');
const logger = require('../../config/logging');
const db = require('../../models');
const config = require('../../config/auth.js')
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const service = 'auth-service';
exports.signup = async (req, res) => {

    //Registrar un nuevo usuario
    const v = new Validator(req.body, {
        /**
         * username y email se validan a traves de middleware
         */
        primerNombre: 'required|string',
        primerApellido: 'required|string',
        password: 'required|string|minLength:8|same:password_confirmation',
    });
    v.check().then((matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            User.create({
                primerNombre: req.body.primerNombre,
                primerApellido: req.body.primerApellido,
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password),
                roleId: req.body.roleId,
            }).then(() => {
                return res.status(200).send({
                    message: "Usuario registrado con éxito",
                });
            }).catch(error => {
                logger.logError('Error al registrar usuario', service, error, res)
            });
        }
    });
}

exports.signin = async (req, res) => {
    const v = new Validator(req.body, {
        username: 'required|string',
        password: 'required|string',
    });
    
    v.check().then(async (matched) => {
        if (!matched) {
            return res.status(400).send(v.errors);
        } else{
            User.findOne({
                where: {
                    username: req.body.username,
                },
            }).then(user => {
                if (!user) {
                    return res.status(404).send({ message: "Usuario no encontrado" });
                }
                const passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );
                if (!passwordIsValid) {
                    return res.status(401).send({
                        message: "Contraseña incorrecta",
                    });
                }
                const token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400, // 24 horas
                });
                Role.findOne({
                    where: {
                        id: user.roleId,
                    },
                }).then(role => {
                    req.session.token = token;
                    return res.status(200).send({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        roles: role.name,
                    });
                }).catch(error => {
                    logger.logError('Error al consultar el rol del usuario.', service, error, res)
                });
            }).catch(error => {
                logger.logError('Error al iniciar sesión.', service, error, res)
            });
        }
    });
};

exports.signout = async (req, res) => {
    try {
        if(req.session.token){
            req.session = null;
            return res.status(200).send({
                message: "Sesión cerrada con éxito.",
            });
        } else{
            return res.status(200).send({
                message: "No ha iniciado sesión.",
            });
        }
    } catch (err) {
        logger.logError('Error al cerrar sesión', service, error, res)
    }
};