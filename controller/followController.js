const req = require("express/lib/request");
const res = require("express/lib/response");
const Follow = require("../model/Follow");
const User = require("../model/User");

const prueba3 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba follow funcionando"
    });
}

//SEGUIR A UN USUARIO - FOLLOW
const followed = async(req, res) => {
    //Obtener el user identity con el token. Este user es el que quiere seguir a otro
    const user_identity_by_token = req.user;
    //Obtener al user que quiero seguir, hacer follow
    const user_followed_id = req.body.followed;

    try {
        //Comprobamos si el usuario que queremos seguir existe
        const find_user_followed = await User.findById({_id: user_followed_id});
        if(find_user_followed) console.log("User finded: " +find_user_followed._id)

    } catch (error) {
        return res.status(404).send({
            message: "Este usuario no existe"
        });
    }

    //Comprombamos si ya seguimos o no a ese usuario, para no duplicar el mismo objeto pero con distinto ID
    const find_object_followed = await Follow.find(
        {
            $and: [
                { user: user_identity_by_token.id },
                { followed: user_followed_id }
            ]
        }
    );

    if(find_object_followed.length >=1) {
        return res.status(200).json({
            message: "Ya sigues a este usuario.",
            find_object_followed: find_object_followed
        });
    }else{
        try {
            //Creamos y guardamos el objeto Follow pasándole los parámetros
            let followed_user = await new Follow({
                user: user_identity_by_token.id,
                followed: user_followed_id
            }).save();
    
            return res.status(200).json({
                message: "Has seguido correctamente a este usuario:",
                followed_user: followed_user.followed,
                user_identity: user_identity_by_token.id,
                object_follow: followed_user
            })
    
        } catch (error) {
            return res.status(500).json({
                message: "Error al seguir al usuario."
            });
        }   
    }
}

//DEJAR DE SEGUIR A UN USUARIO - UNFOLLOW
const unFollowed = async(req, res) => {
    //Obtener el id del usuario identificado, yo
    const user_identity = req.user;
    //Obtener el id del usuario que queremos hacer unFollow
    const id_params = req.params.id;
    //Coprobamos que el ID que pasamos existe
    try {
        const find_user_by_id = await User.findById({_id: id_params});
        console.log("ID correcto")
    } catch (error) {
        return res.status(400).json({
            message: "Este usuario NO existe."
        });
    }
    //Comprobamos si ya seguimos o no a este usuario.
    //Aquí hay una diferencia importante con el método anterior.
    //find (devuelve un array de objetos aunque sólo exista 1) y no se podrá acceder a sus propiedades.
    //findOne devuelve un único objeto y si podemos acceder a sus propiedades
    try {
        const find_object_followed = await Follow.findOne(
            {
                $and: [
                    { user: user_identity.id },
                    { followed: id_params }
                ]
            }
        );

        if(find_object_followed){
            const unfollow_user = await Follow.findByIdAndDelete({_id: find_object_followed._id});
            return res.status(200).send({
                message: "Has dejado de seguir a este usuario.",
                unFollow: unfollow_user._id
            })
        }else{
            return res.status(404).json({
                message: "No puedes dejar de seguir a un usuario que no sigues."
            });
        }
        
    } catch (error) {
        return res.status(404).json({
            message: "Error al hacer unFollow."
        });
    }
}

module.exports = {
    prueba3,
    followed,
    unFollowed
}