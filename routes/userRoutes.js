//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const userController = require("../controller/userController");
//Importamos el Middleware de authorization creado
const auth = require("../middlewares/auth");

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba1", auth.authorizationLogin, userController.prueba1); //Incorporamos el Middleware definido de authorization
router.post("/addUser", userController.addUser);
router.post("/login", userController.login);
router.get("/getDataUser/:id", auth.authorizationLogin, userController.getDataUser);
router.get("/listUser/:page?", auth.authorizationLogin, userController.listUser);

module.exports = router;