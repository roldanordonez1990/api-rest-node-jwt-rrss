//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const publicationController = require("../controller/publicationController");
//Importamos el middleware de autentificación
const auth = require("../middlewares/auth");
//Importamos multer para la subida de img
const multer = require("multer");
//Configuramos el almacenamiento de img. 
const almacenamiento = multer.diskStorage({
    //cb es la ruta donde queremos guardar
    destination: (req, file, cb) => {
        cb(null, "./images/publications");
    },
    //cb en este caso es el nombre del FILENAME que le queremos dar al fichero subido.
    //Empieza por la palabra publication + fecha + nombre original.
    filename: (req, file, cb) => {
        cb(null, "publication-" + Date.now() +"-"+file.originalname);

    }
});
//Una vez configurado el almacenamiento, lo añadimos a multer en el param storage.
//Esto va a actuar como un MIDDLEWARE, o sea, esta acción se va a ejecutar ANTES que el método de HTTP
const subidas = multer({storage: almacenamiento});

//DEFINIMOS LAS RUTAS PARA PUBLICATION
router.get("/prueba2", publicationController.prueba2);
router.post("/addPublication", auth.authorizationLogin, publicationController.addPublication);
router.get("/getPublicationDetail/:id?", auth.authorizationLogin, publicationController.getPublicationDetail);
router.delete("/removePublication/:id?", auth.authorizationLogin, publicationController.removePublication);
router.get("/getPublicationsUser/:id?/:page?", auth.authorizationLogin, publicationController.getPublicationsUser);
router.post("/uploadPublicationImg/:id?", [auth.authorizationLogin, subidas.single("file")], publicationController.uploadPublicationImg);
router.get("/getImgPublication/:filename?", auth.authorizationLogin, publicationController.getImgPublication);
router.get("/feed/:page?", auth.authorizationLogin, publicationController.feed);

module.exports = router;