const req = require("express/lib/request");
const res = require("express/lib/response");

const prueba2 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba publication funcionando"
    });
}

module.exports = {
    prueba2
}