//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const publicationController = require("../controller/publicationController");

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba2", publicationController.prueba2);

module.exports = router;