const Follow = require("../model/Follow");

//FOLLOWING AND FOLLOWERS
const followingAndFollowersId = async(identityUserId) => {

    try {
        //Recogemos a todos los usuarios que nosotros seguimos (followed). 
        //Con el Select, indicamos que sólo queremos que nos saque el ID de ellos
        let following = await Follow.find({user: identityUserId}).select({"followed": 1, "_id": 0});
        //Recogemos a todos los usuarios nos siguen (followers). 
        let followers = await Follow.find({followed: identityUserId}).select({"user": 1, "_id": 0});

        //El método anterior nos devuelve un array de OBJETOS. 
        //Pero lo que queremos es sacar una ARRAY limpio con esos ID.
        let followingArray = [];
        following.forEach(follow =>{
            followingArray.push(follow.followed);
        });
        
        let followersArray = [];
        followers.forEach(follow =>{
            followersArray.push(follow.user);
        });

        return {
            followingId: followingArray,
            followersId: followersArray
        }
            
    } catch (error) {
        return {}
    }
}

//MÉTODO PARA SABER INDIVIDUALMENTE SI UN USER ME SIGUE Y YO A ÉL
//SE VERÁ EN EL MÉTODO GETDATAUSERPROFILE DEL USERCONTROLLER
const followThisUser = async(identityUserId, userProfileId) =>{
    try {
        //¿Lo sigo yo a él?
        const following = await Follow.findOne({user: identityUserId, followed: userProfileId}).select({"user": 1, "followed": 1});
        //¿Me sigue él a mi?
        const follower = await Follow.findOne({user: userProfileId, followed: identityUserId}).select({"user": 1, "followed": 1});

        return {
            following,
            follower
        }
    } catch (error) {
        return {}
    }
}

module.exports = {
    followingAndFollowersId,
    followThisUser
}