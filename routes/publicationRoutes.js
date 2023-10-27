//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const publicationController = require("../controller/publicationController");
//Importamos el middleware de autentificación
const auth = require("../middlewares/auth");

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba2", publicationController.prueba2);
router.post("/addPublication", auth.authorizationLogin, publicationController.addPublication);
router.get("/getPublicationDetail/:id?", auth.authorizationLogin, publicationController.getPublicationDetail);
router.delete("/removePublication/:id?", auth.authorizationLogin, publicationController.removePublication);
router.get("/getPublicationsUser/:id?/:page?", auth.authorizationLogin, publicationController.getPublicationsUser);

module.exports = router;