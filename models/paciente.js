const mongoose = require('mongoose');
const { Schema } = mongoose;
const Usuario = require('./usuario');

const PacienteSchema = new Schema({
    //nroPaciente:{type: String, required:true, unique:true},
    obraSocial: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    dni: { type: String, required: true },
    email: { type: String, required: true },
    userId:{
        type: Schema.Types.ObjectId,
        ref:'Usuario',
        required:true,
        unique:true
    }
})

module.exports = mongoose.models.Paciente || mongoose.model('Paciente', PacienteSchema);