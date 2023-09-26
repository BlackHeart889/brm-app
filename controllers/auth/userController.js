exports.allAccess = (req, res) => {
    res.status(200).send("Vista pública.");
};
exports.clienteBoard = (req, res) => {
res.status(200).send("Vista de cliente.");
};
exports.administradorBoard = (req, res) => {
res.status(200).send("Vista de administrador.");
};
