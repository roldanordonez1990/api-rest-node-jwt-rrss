//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const followController = require("../controller/followController");

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba3", followController.prueba3);

module.exports = router;