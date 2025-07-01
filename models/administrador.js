const mongoose = require('mongoose');
const { Schema } = mongoose;
const Usuario = require('./usuario');

const AdministradorSchema= new Schema({

    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    telefono: {type: String, required: true},
    direccion: {type: String, required: true},
    dni: {type: String, required: true},
    userId:{
        type: Schema.Types.ObjectId,
        ref:'Usuario',
        required:true,
        unique:true
    }
})

module.exports = mongoose.models.Administrador || mongoose.model('Administrador', AdministradorSchema);