const {Schema, model} = require("mongoose");

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },

    text: {
        type: String,
        require: true
    },

    file: {
        type: String
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Publication", PublicationSchema, "publication");
