const {Schema, model} = require("mongoose");

const UserSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    nick: {
        type: String,
        required: true
    },
    bio:{
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imagen: {
        type: String,
        default: "default.png"
    },
    role: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
   
})

module.exports = model("User", UserSchema, "user")