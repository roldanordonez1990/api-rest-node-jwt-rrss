const req = require("express/lib/request");
const res = require("express/lib/response");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const pagination = require("mongoose-pagination");

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
  const passaword_validated = await bcrypt.compareSync(params.password, user_finded.password);

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
        user: user_registered
      });
    }
  } catch (error) {
    return res.status(400).send({
      message: "No existe un usuario con este ID",
    });
  }
};

//LISTADO CON PAGINACIÓN DE USUARIOS
const listUser = async(req, res) =>{
  try {
    //Por defecto la page es 1
    let page = 1;
    //Si llega por parámetro, se reasigna
    if(req.params.page){
      page = req.params.page;
    }
    page = parseInt(page);

    //Usuarios por página
    const itemForPage = 5;

    //Paginate es un método propio de Mongoose. Hace falta importar mongoose-pagination
    const list_users_finded = await User.find().sort("_id").paginate(page, itemForPage);
    
    if(list_users_finded){
      //Hacemos una consulta para sacar el total de usuarios que hay para poder calcular el num páginas
      const total_users = await User.find();
      return res.status(200).send({
        message: "Listado de usuarios encontrado",
        users: list_users_finded,
        page: page,
        itemForPage: itemForPage,
        total_users: total_users.length,
        //Dividimos el total de usuarios entre los usuarios por página. Math.ceil redondea al alza
        total_pages: Math.ceil(total_users.length/itemForPage)
      });
    }
  } catch (error) {
    return res.status(404).send({
      message: "No se han encontrado usuarios"
    })
  }
}

module.exports = {
  prueba1,
  addUser,
  login,
  getDataUser,
  listUser
};
