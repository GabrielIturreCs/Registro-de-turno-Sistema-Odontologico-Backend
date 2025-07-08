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
      fechaCreacion: {type: Date, default: Date.now},
      // Campos de pago mejorados
      paymentId: {type: String}, // ID de pago de MercadoPago
      paymentStatus: {type: String}, // Estado del pago (approved, pending, rejected, refunded, cancelled)
      metodoPago: {type: String, enum: ['efectivo', 'online'], default: 'efectivo'}, // Método de pago seleccionado
      fechaPago: {type: Date}, // Fecha cuando se procesó el pago
      montoRecibido: {type: Number}, // Monto realmente recibido (puede diferir del precio por descuentos/promociones)
      // Campos adicionales para trazabilidad
      paymentNotificationDate: {type: Date}, // Fecha de notificación del webhook
      paymentDetails: {type: Object} // Detalles adicionales del pago (JSON)
})

module.exports = mongoose.models.Turno || mongoose.model('Turno', TurnoSchema);