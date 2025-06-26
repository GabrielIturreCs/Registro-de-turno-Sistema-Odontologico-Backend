// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); // Importa tu modelo de Usuario

// Obtener el secreto JWT de las variables de entorno.
const JWT_SECRET = process.env.JWT_SECRET; 

// Middleware de autenticación para verificar el token JWT de la sesión
const verifyToken = async (req, res, next) => {
    try {
        // Obtener el encabezado de autorización
        const authHeader = req.header('Authorization');

        // 1. Verificar si el encabezado de autorización existe y tiene el formato 'Bearer TOKEN'
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso denegado. Token de autenticación no proporcionado o formato inválido (debe ser "Bearer [token]").' 
            });
        }

        // Extraer el token de la cadena "Bearer TOKEN"
        const token = authHeader.replace('Bearer ', '');

        // 2. Verificar el token JWT
        // Esto lanzará un error si el token es inválido (firma incorrecta, expirado, etc.)
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Buscar al usuario en la base de datos usando el ID decodificado del token
        // Seleccionamos -password para no cargar el hash de la contraseña en la solicitud
        const user = await Usuario.findById(decoded.id).select('-password');

        if (!user) {
            // Si el ID del token no corresponde a un usuario en la BD (o está inactivo/eliminado)
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso denegado. Usuario asociado al token no encontrado o inactivo.' 
            });
        }

        //  verificar si el usuario está confirmado aquí también,
        if (!user.isConfirmed) {
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso denegado. Tu cuenta no ha sido confirmada.' 
            });
        }

        // 4. Adjuntar el token y el objeto de usuario a la solicitud para que estén disponibles
        req.token = token; // El token JWT original
        req.user = user;   // El objeto de usuario de Mongoose (sin contraseña)
        
        // 5. Continuar al siguiente middleware o a la función del controlador de la ruta
        next();
    } catch (error) {
        console.error('Error de autenticación en middleware:', error); // Log más específico

        // Manejo específico de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            // Esto cubre tokens mal formados, firmas incorrectas, etc.
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido o corrupto. Acceso denegado.' 
            });
        }
        // Para cualquier otro error inesperado
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor en la autenticación.' 
        });
    }
};

// Exportación del middleware.

module.exports = { verifyToken };