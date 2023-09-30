const req = require("express/lib/request");
const res = require("express/lib/response");
const jwt = require("jwt-simple");
const moment = require("moment");
const { secret_key } = require("../services/jwt");

//MIDDLEWARE
//PASO 1: Hay que añadir este Middleware dentro de las rutas de petición, antes del método del controlador.
//PASO 2: Generar el token con el método de Login, registrando el usuario.
//PASO 3: Si queremos recuperarlo y obtener los datos, en el Headers de las demás peticiones, añadir el Authorization y el token generado antes.
const authorizationLogin = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "Missing header authorization",
    });
  }

  //Con una regex, limpiamos un poco las posibles comillas que traiga. Si no se pone también funciona.
  //Obtenemos el token enviado por el headers
  let token_encoded = req.headers.authorization.replace(/['"]+/g, "");

  //Decodificar el toker
  try {
    let payload_user_token = jwt.decode(token_encoded, secret_key);
    //Comprobamos si la fecha de expiración ha caducado. Si es < que la fecha actual
    if (payload_user_token.exp <= moment().unix()) {
      return res.status(401).send({
        message: "Error. El token ha expirado",
      });
    }
    //Añadimos el usuario en cada request. ¿¿ESTO ES COMO SI FUESE EL INTERCEPTOR DE ANGULAR??
    //Podemos poner lo que queramos en req.user, req.xxxx
    //Luego se escribe igual cuando lo recojamos en el método de la ruta donde esté el middleware
    req.user = payload_user_token;
  } catch (error) {
    return res.status(404).send({
      message: "Invalid Token",
      error,
    });
  }
  //Continuamos a la siguiente acción de la petición. En este caso el controlador.
  next();
}

module.exports = {
    authorizationLogin
}
