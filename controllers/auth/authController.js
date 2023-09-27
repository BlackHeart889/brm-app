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

/**
 * @api {post} /api/auth/signup Registro de usuarios
 * @apiName signup
 * @apiGroup Auth
 *
 * @apiBody {String} username Nombre de usuario
 * @apiBody {String} email Correo electrónico
 * @apiBody {String} primerNombre Primer nombre
 * @apiBody {String} primerApellido Primer apellido
 * @apiBody {String} password Contraseña
 * @apiBody {String} password_confirmation Confirmación de contraseña
 * @apiParamExample {json} Body:
 *   {
 *       "primerNombre": "Cristhian",
 *       "primerApellido": "Monrroy",
 *       "username": "cmonrroy5",
 *       "email": "monrroy5@gmail.com",
 *       "password": "12345678",
 *       "password_confirmation": "12345678",
 *       "roleId": 1
 *   }
 *
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Usuario registrado con éxito"
 *      }
 *
 * @apiError EmailEnUso El correo ingresado ya está en uso.
 * @apiErrorExample {json} EmailEnUso:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "EmailEnUso"
 *     }
 *
 * @apiError UsernameEnUso El nombre de usuario ingresado ya está en uso.
 * @apiErrorExample {json} UsernameEnUso:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "UsernameEnUso"
 *     }
 * 
 * @apiError ErrorDeValidacion Los datos ingresados no son válidos.
 * @apiErrorExample {json} ErrorDeValidacion:
 *     HTTP/1.1 400 Bad Request
 *     {
 *          "primerNombre": {
 *              "message": "El campo primer nombre es obligatorio.",
 *              "rule": "required"
 *          }
 *     }
 * 
 * @apiError ErrorValidandoUsuario Ocurrió un error al validar la existencia del usuario en el sistema.
 * @apiErrorExample {json} ErrorValidandoUsuario:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorValidandoUsuario"
 *     }
 * 
 */
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
                logger.logError('ErrorRegistrandoUsuario', service, error, res)
            });
        }
    });
}

/**
 * @api {post} /api/auth/signin Inicio de Sesión
 * @apiName signin
 * @apiGroup Auth
 *
 * @apiBody {String} username Nombre de usuario
 * @apiBody {String} password Contraseña
 *
 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "cmonrroy5",
 *       "password": "12345678",
 *   }
 * @apiSuccess {Integer} id ID del usuario.
 * @apiSuccess {String} username Nombre de usuario.
 * @apiSuccess {String} email Correo electrónico del usuario.
 * @apiSuccess {String} rol Rol del usuario.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "id": 1,
 *          "username": "cmonrroy",
 *          "email": "monrroy@gmail.com",
 *          "roles": "Adminsitrador"
 *      }
 *
 * @apiError ContrasenaIncorrecta La contraseña ingresada no es válida.
 * @apiErrorExample {json} ContrasenaIncorrecta:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "ContrasenaIncorrecta"
 *     }
 * 
 * @apiError UsuarioNoEncontrado El usuario no se encuentra registrado.
 * @apiErrorExample {json} UsuarioNoEncontrado:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsuarioNoEncontrado"
 *     }
 * 
 * @apiError ErrorIniciandoSesion No se consultó correctamente el usuario en la base de datos.
 * @apiErrorExample {json} ErrorIniciandoSesion:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorIniciandoSesion"
 *     }
 * 
 * @apiError ErrorConsultandoRolUsuario Ocurrió un error al consultar el rol en la base de datos.
 * @apiErrorExample {json} ErrorConsultandoRolUsuario:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorConsultandoRolUsuario"
 *     }
 */
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
                    return res.status(404).send({ error: "UsuarioNoEncontrado" });
                }
                const passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );
                if (!passwordIsValid) {
                    return res.status(400).send({
                        message: "ContraseñaIncorrecta",
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
                        rol: role.name,
                    });
                }).catch(error => {
                    logger.logError('ErrorConsultandoRolUsuario.', service, error, res)
                });
            }).catch(error => {
                logger.logError('ErrorIniciandoSesion', service, error, res)
            });
        }
    });
};

/**
 * @api {post} /api/auth/signout Cierre de Sesión
 * @apiName signout
 * @apiGroup Auth
 *
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "message": "Sesión cerrada con éxito.",
 *      }
 *
 * @apiError SesionNoIniciada No ha iniciado sesión.
 * @apiErrorExample {json} SesionNoIniciada:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "SesionNoIniciada"
 *     }
 * 
 * @apiError ErrorCerrandoSesion No se eliminó con éxito el token de sesión.
 * @apiErrorExample {json} ErrorCerrandoSesion:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ErrorCerrandoSesion"
 *     }
 */
exports.signout = async (req, res) => {
    try {
        if(req.session.token){
            req.session = null;
            return res.status(200).send({
                message: "Sesión cerrada con éxito.",
            });
        } else{
            return res.status(400).send({
                error: "SesionNoIniciada",
            });
        }
    } catch (err) {
        logger.logError('ErrorCerrandoSesion', service, error, res)
    }
};