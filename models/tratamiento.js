const mongoose = require('mongoose');
const {Schema} = mongoose;

const TratamientoSchema = new Schema({
      nroTratamiento: {type: Number, required: true},
      descripcion: {type: String, required: true},
      duracion: {type: String, required: true},
      precio: {type: Number, required: true}
})

module.exports = mongoose.models.Tratamiento || mongoose.model('Tratamiento', TratamientoSchema);   