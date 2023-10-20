//Importamos express
const express = require("express");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const followController = require("../controller/followController");
const auth = require("../middlewares/auth");

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba3", followController.prueba3);
router.post("/follow", auth.authorizationLogin, followController.follow);
router.delete("/unFollowed/:id", auth.authorizationLogin, followController.unFollowed);
router.get("/following/:id?/:page?", auth.authorizationLogin, followController.following);
router.get("/followers/:id?/:page?", auth.authorizationLogin, followController.followers);
router.get("/followingAndFollowers/:id?/:page?", auth.authorizationLogin, followController.followingAndFollowers);

module.exports = router;