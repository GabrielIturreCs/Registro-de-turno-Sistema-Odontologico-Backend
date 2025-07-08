const jwt = require('jsonwebtoken');

const cookieHelper = {};

// Configuración de cookies
const COOKIE_OPTIONS = {
    httpOnly: true, // No accesible desde JavaScript del cliente
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Para CORS en producción
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    path: '/'
};

// Verificar que COOKIE_SECRET esté configurado
const getCookieSecret = () => {
    if (!process.env.COOKIE_SECRET) {
        console.warn('⚠️ COOKIE_SECRET no está configurado, usando valor por defecto');
        return 'default-secret-key-for-development';
    }
    return process.env.COOKIE_SECRET;
};

// Crear y establecer cookie de información de turno
cookieHelper.setTurnoCookie = (res, turnoInfo) => {
    try {
        const token = jwt.sign(
            { turnoData: turnoInfo }, 
            getCookieSecret(), 
            { expiresIn: '1h' } // El turno expira en 1 hora
        );
        
        res.cookie('turno_pendiente', token, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 1000 // 1 hora para cookies de turno
        });
        
        console.log('🍪 Cookie de turno establecida exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error al establecer cookie de turno:', error);
        return false;
    }
};

// Obtener información de turno desde cookie
cookieHelper.getTurnoCookie = (req) => {
    try {
        const token = req.cookies?.turno_pendiente;
        if (!token) {
            console.log('🚫 No se encontró cookie de turno');
            return null;
        }
        
        const decoded = jwt.verify(token, getCookieSecret());
        console.log('✅ Cookie de turno decodificada exitosamente');
        return decoded.turnoData;
    } catch (error) {
        console.error('❌ Error al decodificar cookie de turno:', error);
        return null;
    }
};

// Limpiar cookie de turno
cookieHelper.clearTurnoCookie = (res) => {
    try {
        res.clearCookie('turno_pendiente', {
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
        });
        console.log('🧹 Cookie de turno eliminada');
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar cookie de turno:', error);
        return false;
    }
};

// Establecer cookie de estado de pago
cookieHelper.setPaymentStatusCookie = (res, status, userType = 'paciente') => {
    try {
        const paymentData = {
            status,
            userType,
            timestamp: Date.now()
        };
        
        const token = jwt.sign(
            { paymentData }, 
            getCookieSecret(), 
            { expiresIn: '10m' } // 10 minutos
        );
        
        res.cookie('payment_status', token, {
            ...COOKIE_OPTIONS,
            maxAge: 10 * 60 * 1000 // 10 minutos
        });
        
        console.log('🍪 Cookie de estado de pago establecida:', status);
        return true;
    } catch (error) {
        console.error('❌ Error al establecer cookie de pago:', error);
        return false;
    }
};

// Obtener estado de pago desde cookie
cookieHelper.getPaymentStatusCookie = (req) => {
    try {
        const token = req.cookies?.payment_status;
        if (!token) {
            return null;
        }
        
        const decoded = jwt.verify(token, getCookieSecret());
        return decoded.paymentData;
    } catch (error) {
        console.error('❌ Error al decodificar cookie de pago:', error);
        return null;
    }
};

// Limpiar cookie de estado de pago
cookieHelper.clearPaymentStatusCookie = (res) => {
    try {
        res.clearCookie('payment_status', {
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
        });
        console.log('🧹 Cookie de estado de pago eliminada');
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar cookie de pago:', error);
        return false;
    }
};

module.exports = cookieHelper;
