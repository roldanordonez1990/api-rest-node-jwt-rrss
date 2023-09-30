//Import necesarios
const {conection} = require("./database/conection")
const express = require("express");
const cors = require("cors")

console.log("API Rest arrancada!")

//Conexión con la BD
conection();
//Crear servidor de NODE con conexiones HTTP a partir de Express
const app = express();
const puerto = 3900;
//Los use son como Middleware. Se ejecutan antes de una acción. Aquí ejecutamos el cors antes de una ruta 
//para que no de problemas
app.use(cors())
//Con este use Middleware parseamos directamente los objetos json para ser utilizados
//En formato content-type app/json
app.use(express.json());
//Aqui en formato form-urlencoded
app.use(express.urlencoded({extended: true}));
//Crear servidor y escuchar peticiones http
app.listen(puerto, () =>{
    console.log("Servidor NODE corriendo y escuchando en el puerto: " +puerto);
});

//Importamos las rutas para cada uno de los Modelos:
const routesUser = require("./routes/userRoutes");
const routesPublication = require("./routes/publicationRoutes");
const routesFollow = require("./routes/followRoutes");
//El primer parámetro es opcional, le indicamos lo que queramos con que empiece la url de nuestras rutas
//app.use("/api-rrss", routesUser, routesPublication, routesFollow);
app.use("/api-rrss/user", routesUser);
app.use("/api-rrss/publication", routesPublication);
app.use("/api-rrss/follow", routesFollow);

//Petición de prueba para comprobar que funciona Express
app.get("/probando", (req, res) =>{
    //Con send podemos enviar lo que queramos. Datos, Objetos, HTML....
    return res.status(200).send({
        nombre: "Franciso",
        profesion: "Web Developer"
    })
})


