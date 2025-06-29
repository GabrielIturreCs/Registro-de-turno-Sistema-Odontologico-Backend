const mongoose = require('mongoose')
const {Schema} = mongoose;

const TurnoSchema = new Schema({
      nroTurno: {type:Number, require:true},
      fecha: {type:String, require:true},
      hora:{type: String, require:true},
      estado:{type: String, require:true}  
})

module.exports = mongoose.models.Turno || mongoose.model('Turno', TurnoSchema);