const jwt = require("jwt-simple");
const moment = require("moment");

//Clave secreta para generar el token que sólo tendremos nosotros
const secret_key = "XxxxxxxX";

//Función para generar el token de jwt
const generateJwt = (user) =>{
    //Estos datos son todo lo que se va a cargar dentro del jwt
    const payload = {
        id: user._id,
        nombre: user.nombre,
        nick: user.nick,
        bio: user.bio,
        email: user.email,
        password: user.password,
        imagen: user.imagen,
        role: user.role,
        iat: moment().unix(), //Fecha de creación
        exp: moment().add(30, "days").unix() //Fecha de expiración
    }
    //Devolvemos el token generado
    return jwt.encode(payload, secret_key);
}

module.exports = {
    generateJwt,
    secret_key
}