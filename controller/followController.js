const req = require("express/lib/request");
const res = require("express/lib/response");

const prueba3 = (req, res) => {
    return res.status(200).json({
        mensaje: "Prueba follow funcionando"
    });
}

module.exports = {
    prueba3
}