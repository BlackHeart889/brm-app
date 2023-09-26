const authJwt = require("../middleware/auth/auth");
const controller = require("../controllers/productos/productosController");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
        );
        next();
    });

    //Select
    app.get(
		"/api/products",
        [authJwt.verifyToken],
        controller.allProducts
    );
    
	app.get(
		"/api/products/:id",
        [authJwt.verifyToken,] , 
        controller.showProduct
    );

    //Insert
    app.post(
        "/api/products/new-product",
        [authJwt.verifyToken, authJwt.isAdministrador],
        controller.newProduct,
    );
	//Update
    app.patch(
        "/api/products/update-product/:id",
        [authJwt.verifyToken, authJwt.isAdministrador],
        controller.updateProduct
    );
	//Delete
	app.delete(
        "/api/products/delete-product/:id",
        [authJwt.verifyToken, authJwt.isAdministrador],
        controller.deleteProduct,
    );
};