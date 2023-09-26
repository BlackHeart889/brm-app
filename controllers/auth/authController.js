// import vine from '@vinejs/vine';
// const vine = import ('@vinejs/vine');
const { Validator } = require('node-input-validator');
const db = require('../../models');
const config = require('../../config/auth.js')
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    // const vine = import("@vinejs/vine").then( async ({ default: vine, errors }) =>{
    //     const schema = vine.object({
    //         firstName: vine.string(),
    //         lastName: vine.string(),
    //         username: vine.string(),
    //         email: vine.string().email(),
    //         roleId: vine.number().withoutDecimals(),
    //         password: vine
    //           .string()
    //           .minLength(8)
    //           .maxLength(32)
    //           .confirmed()
    //     });
        
    //     try {
    //         const validator = vine.compile(schema);
    //         const output = await validator.validate(req.body);
    //         return res.status(200).send({
    //             message: "Paso validacion",
    //         });
    //     } catch (error) {
    //         if (error instanceof errors.E_VALIDATION_ERROR) {
    //             console.log(error.messages)
    //             return res.status(400).send(error.messages);
    //         } else{
    //             return res.status(500).send({
    //                 message: error.message
    //             });

    //         }
    //     }
    // });
    const v = new Validator(req.body, {
        email: 'required|email',
        password: 'required'
      });
    
      v.check().then((matched) => {
        if (!matched) {
            // return res.status(400).send({
            //     message: "no pasa validacion"
            // });
            return res.status(400).send(v.errors);
        } else{
            return res.status(200).send({
                message: "pasa validacion"
            });
        }
      });
    //Registrar un nuevo usuario
    // try {
    //     const user = await User.create({
    //         firstName: req.body.firstName,
    //         lastName: req.body.lastName,
    //         username: req.body.username,
    //         email: req.body.email,
    //         password: bcrypt.hashSync(req.body.password),
    //         roleId: req.body.roleId, //verificar
    //     });
    //     return res.status(200).send({
    //         message: "Usuario registrado con éxito",
    //     });
    // } catch (error) {
    //     return res.status(500).send({
    //         message: error.message
    //     });
    // }
}

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({
          where: {
            username: req.body.username,
            },
        });
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
        const role = await Role.findOne({
            where: {
            id: user.roleId,
            },
        });
        req.session.token = token;
        return res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: role.name,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
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
        return res.status(500).send({ message: error.message });
    }
};