const mongoose = require("mongoose");
const {Schema} = mongoose;

const UsuarioSchema = new Schema({ 
    nombreUsuario: {type: String, required: true}, 
    password: {type: String, required: true},
    tipoUsuario: {type: String, required: true},
    email: {type: String, unique: true, sparse: true},
    nombre: {type: String, default: ''},
    apellido: {type: String, default: ''},
    dni: {type: String, default: ''},
    telefono: {type: String, default: ''},
    obraSocial: {type: String, default: ''},
    // Campos para Google OAuth
    googleId: {type: String, unique: true, sparse: true},
    picture: {type: String, default: ''},
    // Timestamps
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Middleware para actualizar updatedAt
UsuarioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);