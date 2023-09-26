const authJwt = require("../middleware/auth/auth");
const controller = require("../controllers/auth/userController");
module.exports = function(app) {
	app.use(function(req, res, next) {
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, Content-Type, Accept"
		);
		next();
	});
	app.get("/api/test/all", controller.allAccess);
	app.get(
		"/api/test/user",
		[authJwt.verifyToken, authJwt.isCliente],
		controller.clienteBoard
	);
	app.get(
		"/api/test/admin",
		[authJwt.verifyToken, authJwt.isAdministrador],
		controller.administradorBoard
	);
};