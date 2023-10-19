//Importamos express
const express = require("express");
const { use } = require("express/lib/application");
//Dentro de express, accedemos al método Router para definir las rutas
const router = express.Router();
//Importamos el controlador para usarlo como segundo parámetro en la ruta de petición
const userController = require("../controller/userController");
//Importamos el Middleware de authorization creado
const auth = require("../middlewares/auth");
//Importamos multer para la subida de img
const multer = require("multer");
//Configuramos el almacenamiento de img. 
const almacenamiento = multer.diskStorage({
    //cb es la ruta donde queremos guardar
    destination: (req, file, cb) => {
        cb(null, "./images/avatars");
    },
    //cb en este caso es el nombre del FILENAME que le queremos dar al fichero subido.
    //Empieza por la palabra artículo + fecha + nombre original.
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() +"-"+file.originalname);

    }
});
//Una vez configurado el almacenamiento, lo añadimos a multer en el param storage.
//Esto va a actuar como un MIDDLEWARE, o sea, esta acción se va a ejecutar ANTES que el método de HTTP
const subidas = multer({storage: almacenamiento});

//DEFINIMOS LAS RUTAS PARA USER
router.get("/prueba1", auth.authorizationLogin, userController.prueba1); //Incorporamos el Middleware definido de authorization
router.post("/addUser", userController.addUser);
router.post("/login", userController.login);
router.get("/getDataUserProfile/:id", auth.authorizationLogin, userController.getDataUserProfile);
router.get("/listUser/:page?", auth.authorizationLogin, userController.listUser);
router.put("/updateUser", auth.authorizationLogin, userController.updateUser);
//Single es porque se va a subir un solo fichero. Y el nombre "File" es el que debemos usar como Key al subir. 
//Se puede poner el que quieras
router.post("/uploadAvatar", [auth.authorizationLogin, subidas.single("file")], userController.uploadAvatar);
router.get("/getAvatar/:filename", auth.authorizationLogin, userController.getAvatar);

module.exports = router;