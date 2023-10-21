const req = require("express/lib/request");
const res = require("express/lib/response");
const Follow = require("../model/Follow");
const User = require("../model/User");
const pagination = require("mongoose-pagination");
const followService = require("../services/followServices");

//PRUEBA
const prueba3 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba follow funcionando"
    });
}

//SEGUIR A UN USUARIO - FOLLOW
const follow = async(req, res) => {
    //Obtener el user identity con el token. Este user es el que quiere seguir a otro
    const user_identity_by_token = req.user;
    //Obtener al user que quiero seguir, hacer follow
    const user_followed_id = req.body.followed;
    //Comprobamos que no podemos seguirnos a nosotros mismos
    if(user_followed_id == user_identity_by_token.id){
        return res.status(400).send({
            message: "No puedes seguirte a tí mismo."
        });
    }

    try {
        //Comprobamos si el usuario que queremos seguir existe
        const find_user_followed = await User.findById({_id: user_followed_id});
        if(find_user_followed) console.log("User finded: " +find_user_followed._id)

    } catch (error) {
        return res.status(404).send({
            message: "Este usuario no existe."
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
    
    try {
        //Coprobamos que el ID que pasamos existe
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

//LISTADO DE USUARIOS QUE SIGO
const following = async(req, res) => {
    //Obtener el id del usuario registrado
    let user_identity_id = req.user.id;
    //Si viene indicado por la url y comprobamos si existe
    if(req.params.id) {
        try {
            const user_id = await User.findById({_id: req.params.id});
            user_identity_id = req.params.id;
            console.log("ID correcto");
        } catch (error) {
            return res.status(400).send({
                message: "El ID no es correcto o no existe."
            });
        }
    }

    //Por defecto ponemos la página a 1 para que salga la primera lista
    let page = 1;
    //Si viene por url, se sobreescribe
    if(req.params.page) page = req.params.page;
    //Indicamos el número de usuarios por página
    const itemsPerPage = 5;
    
    try {
        //Paginate es un método propio de Mongoose. Hace falta importar mongoose-pagination
        const users_following = await Follow.find({user: user_identity_id})
        .select({_id: 0, __v: 0, created_at: 0})
        //Con populate podemos filtrar igual que haciendo un Select en una consulta
        //En el primer params, indicamos las propiedas del objeto que salgan completas, en el segundo lo que queremos o no que salga
        //Si queremos que NO salgan algunos campos, lo escribimos con el -
        //.populate("user followed", "-password -role -__v")
        //En este caso, si queremos que sólo salga el nombre y el nick, lo ponemos así:
        .populate("followed", "nombre nick")
        .paginate(page, itemsPerPage);
        //Hacemos una consulta para sacar el total de usuarios que sigo para poder calcular el num páginas
        const total_following = await Follow.find({user: user_identity_id});
        if(users_following.length >= 1 && total_following.length >= 1){
            return res.status(200).send({
                message: "Listado de los usuarios que sigues.",
                following: users_following,
                total_following: total_following.length,
                page: page,
                //Dividimos el total de usuarios entre los usuarios por página. Math.ceil redondea al alza
                total_pages: Math.ceil(total_following.length/itemsPerPage)
            });
        }else{
            return res.status(400).send({
                message: "No sigues a ningún usuario."
            })
        }

    } catch (error) {
        return res.status(500).send({
            message: "Error al mostrar el listado de seguidores."
        })
    }
}

//LISTADO DE USUARIOS QUE ME SIGUEN
const followers = async(req, res) => {
    //Obtener el id del usuario registrado
    let user_identity_id = req.user.id;
    //Si viene indicado por la url y comprobamos si existe
    if(req.params.id) {
        try {
            const user_id = await User.findById({_id: req.params.id});
            user_identity_id = req.params.id;
            console.log("ID correcto");
        } catch (error) {
            return res.status(400).send({
                message: "El ID no es correcto o no existe."
            });
        }
    }

    //Por defecto ponemos la página a 1 para que salga la primera lista
    let page = 1;
    //Si viene por url, se sobreescribe
    if(req.params.page) page = req.params.page;
    //Indicamos el número de usuarios por página
    const itemsPerPage = 5;
    
    try {
        const users_followers = await Follow.find({followed: user_identity_id})
        .select({_id: 0, __v: 0, created_at: 0})
        .populate("user", "nombre nick")
        .paginate(page, itemsPerPage);
        //Hacemos una consulta para sacar el total de usuarios que sigo para poder calcular el num páginas
        const total_followers = await Follow.find({followed: user_identity_id});
        if(users_followers.length >= 1 && total_followers.length >= 1){
            return res.status(200).send({
                message: "Listado de los usuarios que me siguen.",
                followers: users_followers,
                total_followers: total_followers.length,
                page: page,
                //Dividimos el total de usuarios entre los usuarios por página. Math.ceil redondea al alza
                total_pages: Math.ceil(total_followers.length/itemsPerPage)
            });
        }else{
            return res.status(400).send({
                message: "No te sigue ningún usuario."
            })
        }

    } catch (error) {
        return res.status(500).send({
            message: "Error al mostrar el listado de seguidores."
        })
    }

}

//LISTADO LIMPIO DE USUARIOS QUE SIGO
const followingAndFollowers = async(req, res) => {
    //Obtenemos el id del usuario identificado
    let user_identity_id = req.user.id;
    if(req.params.id) user_identity_id = req.params.id;
    //Obtenemos ambos listados de la consulta del servicio
    let followsIds = await followService.followingAndFollowersId(user_identity_id);

    if(followsIds.followersId.length < 1 && followsIds.followingId.length < 1){
        return res.status(200).send({
            message: "Listado siguiendo y seguidores",
            following: "No sigues a nadie",
            followers: "Nadie te sigue"
        });
    }else if(followsIds.followingId.length < 1 && followsIds.followersId >= 1){
        return res.status(200).send({
            message: "Listado siguiendo y seguidores",
            following: "No sigues a nadie",
            followers: followsIds.followersId
        });
    }else if(followsIds.followingId.length >= 1 && followsIds.followersId < 1){
        return res.status(200).send({
            message: "Listado siguiendo y seguidores",
            following: followsIds.followingId,
            followers: "Nadie te sigue"
        });
    }else{
        return res.status(200).send({
            message: "Listado siguiendo y seguidores",
            following: followsIds.followingId,
            followers: followsIds.followersId
        });
    }
}

module.exports = {
    prueba3,
    follow,
    unFollowed,
    following,
    followers,
    followingAndFollowers
}