const req = require("express/lib/request");
const res = require("express/lib/response");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const pagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

//PRUEBA
const prueba1 = (req, res) => {
  return res.status(200).json({
    mensaje: "Prueba user funcionando",
    user: req.user,
  });
};

//CREAR NUEVO USUARIO
const addUser = async (req, res) => {
  let params = req.body;
  //Si se envía vacío alguno de estos campos requeridos..
  if (!params.nombre || !params.nick || !params.email || !params.password) {
    return res.status(400).json({
      mensaje: "Bad request. Faltan datos",
    });
  }
  //Dentro de find, el $or es como un condicional ||
  //Antes comprobamos si ya existe algún campo igual o no
  const user_repeat = await User.find({
    $or: [
      { nick: params.nick.toLowerCase() },
      { email: params.email.toLowerCase() },
    ],
  });
  //Si entra aquí, los campos del usuario están repetidos
  if (user_repeat.length >= 1) {
    console.log(user_repeat.length);
    return res.status(200).json({
      mensaje: "Ya existe un usuario con estos datos",
    });
  } else {
    //Primero encriptamos la pass con la librería bcrypt. El 10 son el número de veces que encripta
    let pass_encriptada = await bcrypt.hash(params.password, 10);
    params.password = pass_encriptada;

    //Se guarda el nuevo usuario
    let user_to_save = await new User(params).save();

    if (!user_to_save || user_to_save == null)
      return res.status(500).send({ message: "Error al guardar el usuario" });

    return res.status(200).json({
      message: "Usuario guardado correctamente",
      user: user_to_save,
    });
  }
};

//LOGIN
const login = async (req, res) => {
  let params = req.body;
  //Si alguno de estos dos campos no se envía
  if (!params.email || !params.password) {
    return res.status(403).send({
      message: "Faltan datos por enviar",
    });
  }
  //Buscamos al usuario
  const user_finded = await User.findOne({ email: params.email });
  //.select({"password": 0});
  //Con select 0 NO mostramos lo que le indicamos

  if (!user_finded) {
    return res.status(404).send({
      message: "No se ha encontrado al usuario deseado",
    });
  }

  //Guardamos el token pasándole el user encontrado
  const token_jwt = jwt.generateJwt(user_finded);

  //Comprobamos la pass con el método compareSync de bcrypt
  const passaword_validated = await bcrypt.compareSync(params.password,user_finded.password);

  if (!passaword_validated) {
    return res.status(404).send({
      message: "No te has identificado correctamente",
    });
  } else {
    return res.status(200).send({
      message: "Te has identificado correctamente",
      //Devolvemos sólo los datos que queremos enviar
      user: {
        id: user_finded._id,
        nombre: user_finded.nombre,
        nick: user_finded.nick,
        bio: user_finded.bio,
        email: user_finded.email,
      },
      token: token_jwt,
    });
  }
};

//OBTENER DATOS DEL USUARIO REGISTRADO
const getDataUser = async (req, res) => {
  const id = req.params.id;
  try {
    //Con select filtramos para que NO muestre la pass y el role
    const user_registered = await User.findById(id).select({password: 0, role: 0});
    if (user_registered) {
      return res.status(200).send({
        message: "Usuario registrado encontrado",
        user: user_registered,
        user_token: req.user,
      });
    }
  } catch (error) {
    return res.status(400).send({
      message: "No existe un usuario con este ID",
    });
  }
};

//LISTADO CON PAGINACIÓN DE USUARIOS
const listUser = async (req, res) => {
  try {
    //Por defecto la page es 1
    let page = 1;
    //Si llega por parámetro, se reasigna
    if (req.params.page) {
      page = req.params.page;
    }
    page = parseInt(page);

    //Usuarios por página
    const itemForPage = 5;

    //Paginate es un método propio de Mongoose. Hace falta importar mongoose-pagination
    const list_users_finded = await User.find().sort("_id").paginate(page, itemForPage);

    if (list_users_finded) {
      //Hacemos una consulta para sacar el total de usuarios que hay para poder calcular el num páginas
      const total_users = await User.find();
      return res.status(200).send({
        message: "Listado de usuarios encontrado",
        users: list_users_finded,
        page: page,
        itemForPage: itemForPage,
        total_users: total_users.length,
        //Dividimos el total de usuarios entre los usuarios por página. Math.ceil redondea al alza
        total_pages: Math.ceil(total_users.length / itemForPage),
      });
    }
  } catch (error) {
    return res.status(404).send({
      message: "No se han encontrado usuarios",
    });
  }
};

//ACTUALIZAR USUARIO
const updateUser = async (req, res) => {
  //Obtener los datos de identificación por token
  const user_token_identity = req.user;
  //Obtener los datos enviados por el body para actualizar
  let user_to_update = req.body;
  //Con delete "borramos" para que no aparezcan estos datos en la respuesta. Pero no se borran como tal
  delete user_token_identity.role;
  delete user_token_identity.iat;
  delete user_token_identity.exp;

  //Comprobar si los datos que queremos actualizar por el body ya existen
  //Dentro de find, el $or es como un condicional ||
  //Antes comprobamos si ya existe algún campo igual o no.
  const user_repeat = await User.find({
    $or: [
      { nick: user_to_update.nick },
      { email: user_to_update.email },
    ],
  });
  //Si el email o el nick que queremos actualizar ya existe en la BBDD, ese usuario ya existe.
  let flag = false;
  //Si enviamos los campos vacíos
  if(user_to_update.nick == "" || user_to_update.email == ""){
    return res.status(404).send({
      message: "No puedes actualizar con los campos vacíos.",
    });
  }
  user_repeat.forEach(users => {
    //Al poner un email o nick que ya existe, el users.id será el de ese usuario encontrado,
    //que será diferente al nuestro, obtenido mediante el token.
    if (users._id != user_token_identity.id) {
      flag = true;
    }
  });
    if (flag) {
      return res.status(404).send({
        message: "Este ususario ya existe.",
      });
    }
    //Encriptamos primero la password, la cambie o llegue la misma
    if(user_to_update.password){
      let password_new = await bcrypt.hash(user_to_update.password, 10);
      user_to_update.password = password_new;
    }
    //Actualizamos el user
    try {
      const user_updated = await User.findByIdAndUpdate({_id: user_token_identity.id}, user_to_update, {new: true}).select({"role" :0});
      return res.status(200).send({
        message: "update ok",
        user_token_identity: user_token_identity,
        user_to_update: user_to_update,
        user_updated: user_updated
      });
    } catch (error) {
      return res.status(404).send({
        message: "Error al actualizar el usuario.",
      });
    }
};

//SUBIDA DE IMAGEN AVATAR
const uploadAvatar = async(req, res) =>{
  if(!req.file){
    return res.status(403).send({
      message: "Petición inválida. No se ha enviado File"
    })
  }
  //Obtenemos el nombre de la imagen subida
  let nombre_img = req.file.originalname;
  //Obtenemos la extensión usando split y cortando a partir del punto
  //extensión devolverá un array. Ej: Si el nombre es Woody.jpg -> ["Woody", "jpg"]
  let extension_split = nombre_img.split(".");
  let extension = extension_split[1];
  if(extension == "png" || extension == "jpeg" || extension == "jpg" || extension == "gift"){
    try {
      const image_user_updated = await User.findByIdAndUpdate(req.user.id, {imagen: req.file.filename}, {new: true});
      if(image_user_updated){
        return res.status(200).send({
          message: "upload avatar ok.",
          file: req.file,
          extension: extension,
          image_user_updated: image_user_updated.imagen
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Error al actualizar la imagen del ususario."
      });
    }
    
  }else{
    //fileSistem (fs) es una librería con la cual podemos borrar el fichero y no se sube
    //Le pasamos el path completo
    fs.unlinkSync(req.file.path);
      return res.status(400).json({
          message: "Formato incorrecto. Archivo no subido."
      });
  }
}

//OBTENER LA IMAGEN O RUTA ABSOLUTA DEL AVATAR
const getAvatar = (req, res) =>{
  //Obtenemos el nombre del avatar por el parámetro de la ruta
  const filename = req.params.filename;
  //Creamos un path absoluto de la imagen
  const ruta_fisica = "./images/avatars/"+filename;
  //el método stat dentro de fileSystem, nos dice si existe o no esa ruta
  fs.stat(ruta_fisica, (err, exists) => {
    if(exists){
      //Si existe, se envía la imagen con sendFile y la librería path
      return res.sendFile(path.resolve(ruta_fisica));
    }else{
      return res.status(404).send({
        message: "El filename no es correcto o no existe"
      })
    }
  });
}

module.exports = {
  prueba1,
  addUser,
  login,
  getDataUser,
  listUser,
  updateUser,
  uploadAvatar,
  getAvatar
};
