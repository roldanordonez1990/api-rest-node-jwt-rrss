const Publication = require("../model/Publication");

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
    if(!publication_id) return res.status(400).send({message: "No has indicado publicación."})
    try {
        //Comprobamos si la publicación existe
        const finded_publication = await Publication.findById({_id: publication_id});
        return res.status(200).send({
            message: "Mostrando publicación con éxito",
            publication_id: finded_publication
        });
    } catch (error) {
        return res.status(404).send({
            message: "Esta publicación no existe.",
        });
    }
}

module.exports = {
    prueba2,
    addPublication,
    getPublicationDetail,
    removePublication
}