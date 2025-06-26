const e = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  nombreUsuario: { type: String, required: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  nombre: { type: String, required: true },
  apellido: { type: String, required: false },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  dni: { type: String, required: true },
  tipoUsuario: { type: String, required: true },
  email: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  confirmationToken: { type: String, default: null },
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
