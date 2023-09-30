//require es como el import. Para las dependencias.
//require lo que hace es buscar dentro del node_module la dependencia.
const mongoose = require("mongoose");

const conection = async () => {
  try {
    //En la ruta de conexión, cambiar localhost por 127.0.0.1
    await mongoose.connect("mongodb://127.0.0.1:27017/red_social");
    console.log("Conectado correctamente a la BD");
  } catch (error) {
    console.log("No se ha podido conectar con la BD");
    throw new Error("No se ha podido conectar con la BD");
  }
};

module.exports = {
  conection
};
