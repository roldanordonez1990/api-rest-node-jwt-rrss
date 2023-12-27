const validator = require("validator")

const validation = (params) =>{
    const nombre_v1 = validator.isEmpty(params.nombre);
    const nombre_v2 = validator.isLength(params.nombre, {min: 3, max: undefined});

    if(nombre_v1 || !nombre_v2){
        throw new Error("No cumple los requisitos de validación");
    }else{
        console.log("Requisitos de validación correctos")
    }
}

module.exports = validation