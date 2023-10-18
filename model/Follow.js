const {Schema, model} = require("mongoose");

const FollowSchema = Schema({
    //Hace referencia al usuario identificado, yo
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    //Hace referencia al usuario que se quiere seguir
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },

    created_at: {
        type: Date,
        defatult: Date.now
    }
});

module.exports = model("Follow", FollowSchema, "follow")