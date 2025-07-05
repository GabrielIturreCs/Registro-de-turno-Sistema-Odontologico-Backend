const mongoose = require("mongoose");
const {Schema} = mongoose;

const UsuarioSchema = new Schema({
    nombreUsuario: {
        type: String,
        // Hacemos que sea opcional si usas solo login con Google
        // Si quieres que siempre tenga un nombre de usuario, considera cómo lo llenarías para usuarios de Google
        required: function() { return !this.googleId; } // Requerido si NO es un usuario de Google
    },
    password: {
        type: String,
        // Hacemos que sea opcional, ya que los usuarios de Google no tendrán contraseña
        required: function() { return !this.googleId; } // Requerido si NO es un usuario de Google
    },
    tipoUsuario: {
        type: String,
        required: true,
        default: 'paciente' // O el tipo de usuario por defecto que quieras asignar a los que vienen de Google
    },
    // --- NUEVOS CAMPOS PARA GOOGLE LOGIN ---
    googleId: {
        type: String,
        unique: true, // Cada googleId debe ser único
        sparse: true // Permite que este campo sea nulo/ausente para usuarios que no usan Google
    },
    email: {
        type: String,
        unique: true, // El email debe ser único
        sparse: true, // Permite que este campo sea nulo/ausente (aunque Google siempre lo provee)
        // Podrías poner required: function() { return this.googleId; } si siempre lo esperas de Google
    },
    displayName: { // Nombre completo o el nombre mostrado por Google
        type: String
        // Puedes hacerlo required: function() { return this.googleId; } si siempre lo esperas de Google
    },
    profilePicture: { // URL de la foto de perfil de Google
        type: String
    },
    // --- FIN DE NUEVOS CAMPOS ---
    createdAt: {
        type: Date,
        default: Date.now // Para registrar cuándo se creó el usuario
    }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);