const mongoose = require('mongoose');
const {Schema} = mongoose;

const TratamientoSchema = new Schema({
      nroTratamiento: {type:Number, require:true},
      descripcion: {type:String, require:true},
      duracion: {type:String, require:true},
      historial: {type: String, require:true},

})

module.exports = mongoose.models.Tratamiento || mongoose.model('Tratamiento', TratamientoSchema);   