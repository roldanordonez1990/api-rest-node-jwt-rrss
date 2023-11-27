const Publication = require("../model/Publication");
const User = require("../model/User");
const pagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followServices");

//PRUEBA
const prueba2 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba publication funcionando"
    });
};

//CREAR UNA PUBLICACIÓN
const addPublication = async(req, res) => {
    //Obtenemos el id del usuario registrado
    const user_identity_id = req.user._id;
    //Recogemos los parámetros enviados por post
    let params = req.body;
    //Comprobamos que nos llegan 
    if(!params.text) return res.status(400).send({message: "Faltan datos por enviar."});
    //Asignamos el user dentro del objeto params
    params.user = user_identity_id;
    //params.file = "default.png";

    try {
        //Creamos la nueva publicación
        const new_publication = await new Publication(params).save();

        return res.status(200).send({
            message: "Has añadido una nueva publicación con éxito.",
            user_identity_id: user_identity_id,
            new_publication: new_publication
        });
        
    } catch (error) {
        return res.status(500).send({
            message: "Error al guardar la publicación.",
        });
    }
}

//ELIMINAR UNA PUBLICACIÓN
const removePublication = async(req, res) => {
    //Obtener el id de la publicación
    const publication_id = req.params.id;
    //Obtener el id del usuario registrado, autor de la publicación
    const user_identity_id = req.user._id;
    //Comprobar si nos llega el id de la publicación
    if(!publication_id) return res.status(400).send({message: "No has indicado publicación."});

    try {
        //Comprobar si la publicacón existe.
        let finded_publication = await Publication.findOne({
        $and:[
            {user: user_identity_id},
            {_id: publication_id}
            ]
        });
        console.log("Esta publicación existe." +finded_publication._id);
    } catch (error) {
        return res.status(404).send({message: "Esta publicación no existe."})
    }
    try {
        //Llegados aquí, la publicación existe. Procederemos a eliminarla
        const remove_publication = await Publication.findByIdAndDelete({_id: publication_id});

        return res.status(200).send({
            message: "Publicación eliminada con éxito.",
            publication_removed: remove_publication._id
        });

    } catch (error) {
        return res.status(500).send({message: "Error al eliminar la publicación."})
    }
}

//OBTENER UNA PUBLICACIÓN
const getPublicationDetail = async(req, res) => {
    //Obtener el id de la publicación
    const publication_id = req.params.id;
    if(!publication_id) return res.status(400).send({message: "No has indicado publicación."});

    try {
        //Comprobamos si la publicación existe
        const finded_publication = await Publication.findOne({_id: publication_id});
        console.log("Esta publicación existe: " + finded_publication._id);
    } catch (error) {
        return res.status(404).send({message: "Esta publicación no existe."});
    }

    try {
        //Llegados aquí, la publicación existe
        const finded_publication = await Publication.findById({_id: publication_id});
        return res.status(200).send({
            message: "Mostrando publicación con éxito",
            publication_id: finded_publication
        });
    } catch (error) {
        return res.status(500).send({
            message: "Error al mostrar la publicación.",
        });
    }
}

//OBTENER TODAS LAS PUBLICACIONES DE UN USUARIO
const getPublicationsUser = async (req, res) => {
    //Obtener el id del usuario
    const user_id = req.params.id;
    //Comprobamos que llegue el id del usuario
    if(!user_id) return res.status(400).send({message: "No has indicado el usuario."});
    //Comprobamos que el usuario existe
    try {
        const user_finded = await User.findOne({_id: user_id});
        console.log("Este usuario sí existe: " +user_finded._id);
    } catch (error) {
        return res.status(404).send({message: "Este usuario no existe."});
    }

    //Asignamos la página
    let page = 1;
    if(req.params.page) page = req.params.page;
    //Número fijo de usuarios por página
    const itemsForPage = 5;

    try {
        //Buscamos las publicaciones del usuario
        const finded_publications = await Publication.find({user: user_id})
        .select({__v: 0}) //Con select decidimos qué queremos y qué no
        .sort("-created_at") //Con sort ordenamos por fecha, en negativo para orden descendente
        .populate("user", "nombre nick") //Con populate desglosamos el objeto user dentro del objeto publication
        .paginate(page, itemsForPage);
        //Sacamos el total de publicaciones limpio del usuario. No de la anterior consulta porque el total sería sólo por página
        const total_publications = await Publication.find({user: user_id});
        if(finded_publications.length >= 1 && total_publications.length >= 1){
            return res.status(200).send({
                message: "Listando publicaciones con éxito.",
                total_publications: total_publications.length,
                total_pages: Math.ceil(total_publications.length/itemsForPage),
                publications: finded_publications
            });
        }else{
            return res.status(404).send({message: "No hay publicaciones que listar."})
        }
        
    } catch (error) {
        return res.status(500).send({message: "Error al listar las publicaciones."});
    }
}

//SUBIDA DE IMAGEN EN LA PUBLICACIÓN
const uploadPublicationImg = async(req, res) =>{
    //Comprobamos que llega el id de publicación
    const publicationId = req.params.id;
    if(!publicationId) return res.status(400).send({message: "No has indicado publicación."});
    //Comprobamos que la publicación existe
    try {
        const finded_publication = await Publication.findOne({_id: publicationId});
        console.log("Esta publicación sí existe: " + finded_publication._id);
    } catch (error) {
        return res.status(404).send({message: "Esta publicación no existe."})
    }
    //Comprobamos que llega el file de publicación
    if(!req.file) return res.status(403).send({ message: "Petición inválida. No se ha enviado File"});
    
    //Obtenemos el nombre de la imagen subida
    let nombre_img = req.file.originalname;
    //Obtenemos la extensión usando split y cortando a partir del punto
    //extensión devolverá un array. Ej: Si el nombre es Woody.jpg -> ["Woody", "jpg"]
    let extension_split = nombre_img.split(".");
    let extension = extension_split[1];
    if(extension == "png" || extension == "jpeg" || extension == "jpg" || extension == "gift"){
      try {
        //Actualizamos la publicación subiendo la imagen
        const file_updated = await Publication.findByIdAndUpdate({_id: publicationId}, {file: req.file.filename}, {new: true});
        if(file_updated){
          return res.status(200).send({
            message: "Has subido la imagen correctamente.",
            file: req.file,
            extension: extension,
            file_publication_updated: file_updated
          });
        }
      } catch (error) {
        return res.status(400).json({
          message: "Error al subir la imagen de publicación."
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

//OBTENER LA IMAGEN O RUTA ABSOLUTA DE LA PUBLICACIÓN
const getImgPublication = (req, res) =>{
    //Comprobamos que llega el filename por la url
    if(!req.params.filename) return res.status(400).send({message: "No has indicado el filename."});
    //Obtenemos el nombre del file por el parámetro de la ruta
    const filename = req.params.filename;
    //Creamos un path absoluto de la imagen
    const ruta_fisica = "./images/publications/"+filename;
    //el método stat dentro de fileSystem, nos dice si existe o no esa ruta
    fs.stat(ruta_fisica, (err, exists) => {
      if(exists){
        //Si existe, se envía la imagen con sendFile y la librería path
        return res.sendFile(path.resolve(ruta_fisica));
      }else{
        return res.status(404).send({
          message: "El filename no es correcto o no existe."
        })
      }
    });
  }

  //FEED DE PUBLICACIONES (MURO)
  const feed = async(req, res) => {
      //Obtener el id del usuario registrado
      const userId = req.user._id;
      //Obtener la página
      let page = 1;
      if(req.params.page) page = req.params.page;
      //Publicaciones fijas por página
      const itemsForPage = 5;

      try {
            //Primero sacamos un array de todos los id de los usuarios que seguimos (Following)
            const following = await followService.followingAndFollowersId(req.user._id);
            //Mostramos todas las publicaciones de los usuarios que sigo
            //Dentro del método find, con la propiedad $in, hará "match" de las publicaciones cuyo user coincida con mis following
            const feed_publications = await Publication.find({
                user: {"$in": following.followingId}
            })
            .sort("-created_at")
            .select({"__v": 0})
            .populate("user", "_id nombre nick")
            .paginate(page, itemsForPage);

            //Sacamos el total de publicaciones con otra consulta a parte. La anterior sólo sacaría el total por página
            const total_feed_publications = await Publication.find({
                user: {"$in": following.followingId}
            });

            if(feed_publications.length >=1 && total_feed_publications.length >= 1){
                return res.status(200).send({
                    message: "Mostrando Feed correctamente.",
                    user_identity: req.user.nick,
                    following: following.followingId,
                    page: page,
                    itemsForPage: itemsForPage,
                    total_publications: total_feed_publications.length,
                    total_pages: Math.ceil(total_feed_publications.length/itemsForPage),
                    feed_publications: feed_publications
                });
            }else{
                return res.status(200).send({message: "No hay publicaciones que mostrar en el feed."});
            }
            
      } catch (error) {
        return res.status(500).send({message: "Error al mostrar el feed."});
      }
  }

module.exports = {
    prueba2,
    addPublication,
    getPublicationDetail,
    removePublication,
    getPublicationsUser,
    uploadPublicationImg,
    getImgPublication,
    feed
}