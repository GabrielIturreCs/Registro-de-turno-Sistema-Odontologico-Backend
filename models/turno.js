const mongoose = require('mongoose')
const {Schema} = mongoose;

const TurnoSchema = new Schema({
      nroTurno: {type:Number, require:true},
      fecha: {type:String, require:true},
      hora:{type: String, require:true},
      estado:{type: String, require:true},
      tratamiento:{type:String, require:true},
      precioFinal:{type:Number, require:true},
      duracion:{type:String, require:true},
      nombre:{type:String, require:true},
      apellido:{type:String, require:true},
      pacienteId:{type: mongoose.Schema.Types.ObjectId, ref:'Paciente', require:true},
      tratamientoId:{type: mongoose.Schema.Types.ObjectId, ref:'Tratamiento', require:true},
      observaciones:{type:String, require:true},
      fechaCreacion:{type:Date, default:Date.now}
      

})

module.exports = mongoose.models.Turno || mongoose.model('Turno', TurnoSchema);