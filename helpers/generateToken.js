const jwt = require('jsonwebtoken');

function generarToken(user) {
  // Carga útil (payload) que quieras incluir en el token (mejor solo lo mínimo necesario)
  const payload = {
    id: user._id,
    nombreUsuario: user.nombreUsuario,
    tipoUsuario: user.tipoUsuario,
  };

  // Clave secreta para firmar el token
  const secret = process.env.JWT_SECRET;

  // Opciones del token (ejemplo: duración de 1 día)
  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secret, options);
}

module.exports = generarToken;
