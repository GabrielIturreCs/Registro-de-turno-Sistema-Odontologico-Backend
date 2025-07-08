const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Genera un token JWT
 * @param {Object} payload - Los datos que se incluirán en el token
 * @returns {String} El token JWT
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verifica un token JWT
 * @param {String} token - El token a verificar
 * @returns {Object} Los datos decodificados del token
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

/**
 * Middleware para verificar autenticación JWT
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: 0,
            msg: 'Token de acceso requerido'
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            status: 0,
            msg: 'Token inválido o expirado'
        });
    }
};

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken
};
