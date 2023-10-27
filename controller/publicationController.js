const Publication = require("../model/Publication");
const User = require("../model/User");
const pagination = require("mongoose-pagination");

//PRUEBA
const prueba2 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba publication funcionando"
    });
};

//CREAR UNA PUBLICACIÓN
const addPublication = async(req, res) => {
    //Obtenemos el id del usuario registrado
    const user_identity_id = req.user.id;
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
    const user_identity_id = req.user.id;
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

module.exports = {
    prueba2,
    addPublication,
    getPublicationDetail,
    removePublication,
    getPublicationsUser
}