const authJwt = require("../middleware/auth/auth");
const controller = require("../controllers/compras/comprasController");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
        );
        next();
    });

    //Detalle compra
    app.get(
		"/api/purchases/details/:id",
        [authJwt.verifyToken, authJwt.isCliente] , 
        controller.showFacturaCompra
    );

    //Compras por Usuario
    app.get(
		"/api/purchases",
        [authJwt.verifyToken, authJwt.isCliente] , 
        controller.showHistorialCompras
    );

    //Todas las Compras
    app.get(
		"/api/purchases/all",
        [authJwt.verifyToken, authJwt.isAdministrador] , 
        controller.showTodasLasCompras
    );

    //Insert
    app.post(
        "/api/purchases/buy",
        [authJwt.verifyToken, authJwt.isCliente],
        controller.comprarProductos,
    );
};