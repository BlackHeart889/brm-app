const db = require('../../models');
const Role = db.role;
const User = db.user;

exports.checkDuplicateUsernameorEmail = async (req, res, next) => {
    try {
        //Validacion Username
        let user = await User.findOne({
            where: {
                username: req.body.username,
            },
        });
        if(user) {
            return res.status(400).send({
                message: "El nombre de usuario ya está en uso",
            });
        }

        user = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if(user) {
            return res.status(400).send({
                message: "El correo electrónico ya está en uso",
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            message: "Error al validar el usuario",
        });
    }
};

exports.checkRolesExisted = async (req, res, next) => {
    let roles = await Role.findAll();
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
};

