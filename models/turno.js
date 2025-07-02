const mongoose = require('mongoose')
const {Schema} = mongoose;

const TurnoSchema = new Schema({
      nroTurno: {type: Number, required: true},
      fecha: {type: String, required: true},
      hora: {type: String, required: true},
      estado: {type: String, required: true, default: 'reservado'},
      tratamiento: {type: String, required: true},
      precioFinal: {type: Number, required: true},
      duracion: {type: String},
      nombre: {type: String, required: true},
      apellido: {type: String, required: true},
      pacienteId: {type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true},
      tratamientoId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tratamiento', required: true},
      observaciones: {type: String},
      fechaCreacion: {type: Date, default: Date.now}
})

module.exports = mongoose.models.Turno || mongoose.model('Turno', TurnoSchema);