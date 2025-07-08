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
    },
    odontograma: {
        type: Object,
        default: {
            "11": { estado: "sano", color: "#fff" },
            "12": { estado: "sano", color: "#fff" },
            "13": { estado: "sano", color: "#fff" },
            "14": { estado: "sano", color: "#fff" },
            "15": { estado: "sano", color: "#fff" },
            "16": { estado: "sano", color: "#fff" },
            "17": { estado: "sano", color: "#fff" },
            "18": { estado: "sano", color: "#fff" },
            "21": { estado: "sano", color: "#fff" },
            "22": { estado: "sano", color: "#fff" },
            "23": { estado: "sano", color: "#fff" },
            "24": { estado: "sano", color: "#fff" },
            "25": { estado: "sano", color: "#fff" },
            "26": { estado: "sano", color: "#fff" },
            "27": { estado: "sano", color: "#fff" },
            "28": { estado: "sano", color: "#fff" },
            "31": { estado: "sano", color: "#fff" },
            "32": { estado: "sano", color: "#fff" },
            "33": { estado: "sano", color: "#fff" },
            "34": { estado: "sano", color: "#fff" },
            "35": { estado: "sano", color: "#fff" },
            "36": { estado: "sano", color: "#fff" },
            "37": { estado: "sano", color: "#fff" },
            "38": { estado: "sano", color: "#fff" },
            "41": { estado: "sano", color: "#fff" },
            "42": { estado: "sano", color: "#fff" },
            "43": { estado: "sano", color: "#fff" },
            "44": { estado: "sano", color: "#fff" },
            "45": { estado: "sano", color: "#fff" },
            "46": { estado: "sano", color: "#fff" },
            "47": { estado: "sano", color: "#fff" },
            "48": { estado: "sano", color: "#fff" }
        }
    }
})

module.exports = mongoose.models.Paciente || mongoose.model('Paciente', PacienteSchema);