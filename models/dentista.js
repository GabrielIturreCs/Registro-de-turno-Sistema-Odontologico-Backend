const mongoose = require('mongoose');
const { Schema } = mongoose;

const DentistaSchema = new Schema({
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    telefono: {type: String, required: true},
    direccion: {type: String, required: true},
    dni: {type: String, required: true},
})

module.exports = mongoose.models.Dentista || mongoose.model('Dentista', DentistaSchema);