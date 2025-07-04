const express = require('express');
const router = express.Router();

console.log('🚀 Payment callback routes loaded successfully');

// Ruta de prueba simple SIN dependencias
router.get('/test', (req, res) => {
    console.log('🧪 === RUTA DE PRUEBA ===');
    res.json({ 
        success: true, 
        message: 'Payment callback routes working!',
        timestamp: new Date().toISOString()
    });
});

// Intentar cargar cookieHelper con manejo de errores
let cookieHelper;
try {
    cookieHelper = require('../helpers/cookieHelper');
    console.log('✅ CookieHelper loaded successfully');
} catch (error) {
    console.error('❌ Error loading cookieHelper:', error.message);
    cookieHelper = null;
}

// Endpoint para manejar fallos de pago - VERSIÓN SIMPLIFICADA
router.get('/failure', (req, res) => {
    console.log('❌ === PAGO FALLIDO (SIMPLE) ===');
    console.log('Query params:', req.query);
    
    // Redirigir directamente al frontend sin usar cookies por ahora
    const redirectUrl = `${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/payment/failure?return=vistaPaciente&userType=paciente`;
    
    console.log('🔄 Redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
});

// Endpoint para manejar pagos pendientes - VERSIÓN SIMPLIFICADA  
router.get('/pending', (req, res) => {
    console.log('⏳ === PAGO PENDIENTE (SIMPLE) ===');
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/payment/pending?return=vistaPaciente&userType=paciente`;
    
    return res.redirect(redirectUrl);
});

// Endpoint para manejar éxito - VERSIÓN SIMPLIFICADA
router.get('/success', (req, res) => {
    console.log('🎉 === PAGO EXITOSO (SIMPLE) ===');
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/payment/success?return=vistaPaciente&userType=paciente`;
    
    return res.redirect(redirectUrl);
});

// VERSIONES COMPLETAS CON COOKIES (solo si cookieHelper está disponible)
if (cookieHelper) {
    console.log('🍪 Enabling cookie-based payment callbacks');
    
    // Endpoint para manejar el retorno exitoso de MercadoPago
    router.get('/success-full', (req, res) => {
    console.log('🎉 === PAGO EXITOSO ===');
    console.log('Query params:', req.query);
    console.log('Cookies:', req.cookies);
    
    // Obtener información del turno desde la cookie
    const turnoInfo = cookieHelper.getTurnoCookie(req);
    
    if (turnoInfo) {
        console.log('✅ Información del turno recuperada:', turnoInfo);
        
        // Establecer cookie de éxito de pago
        cookieHelper.setPaymentStatusCookie(res, 'success', turnoInfo.userType);
        
        // Limpiar cookie de turno pendiente
        cookieHelper.clearTurnoCookie(res);
        
        // Redirigir al frontend con parámetros
        const userRole = turnoInfo.userType === 'paciente' ? 'vistaPaciente' : 'dashboard';
        const redirectUrl = `${process.env.FRONTEND_URL}/payment/success?return=${userRole}&userType=${turnoInfo.userType}&ref=${turnoInfo.externalReference}`;
        
        return res.redirect(redirectUrl);
    } else {
        console.log('⚠️ No se encontró información del turno en cookies');
        
        // Fallback: redirigir al dashboard
        const redirectUrl = `${process.env.FRONTEND_URL}/dashboard`;
        return res.redirect(redirectUrl);
    }
});

// Endpoint para manejar pagos pendientes
router.get('/pending', (req, res) => {
    console.log('⏳ === PAGO PENDIENTE ===');
    
    const turnoInfo = cookieHelper.getTurnoCookie(req);
    
    if (turnoInfo) {
        cookieHelper.setPaymentStatusCookie(res, 'pending', turnoInfo.userType);
        cookieHelper.clearTurnoCookie(res);
        
        const userRole = turnoInfo.userType === 'paciente' ? 'vistaPaciente' : 'dashboard';
        const redirectUrl = `${process.env.FRONTEND_URL}/payment/pending?return=${userRole}&userType=${turnoInfo.userType}`;
        
        return res.redirect(redirectUrl);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

// Endpoint para manejar fallos de pago
router.get('/failure', (req, res) => {
    console.log('❌ === PAGO FALLIDO ===');
    
    const turnoInfo = cookieHelper.getTurnoCookie(req);
    
    if (turnoInfo) {
        cookieHelper.setPaymentStatusCookie(res, 'failure', turnoInfo.userType);
        cookieHelper.clearTurnoCookie(res);
        
        const userRole = turnoInfo.userType === 'paciente' ? 'vistaPaciente' : 'dashboard';
        const redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?return=${userRole}&userType=${turnoInfo.userType}`;
        
        return res.redirect(redirectUrl);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

// Endpoint para verificar el estado del pago desde el frontend
router.get('/status', (req, res) => {
    const paymentStatus = cookieHelper.getPaymentStatusCookie(req);
    const turnoInfo = cookieHelper.getTurnoCookie(req);
    
    if (paymentStatus) {
        // Limpiar cookie después de leer
        cookieHelper.clearPaymentStatusCookie(res);
        
        return res.json({
            success: true,
            paymentStatus: paymentStatus,
            turnoInfo: turnoInfo
        });
    }
    
    return res.json({
        success: false,
        message: 'No payment status found'
    });
});

} else {
    console.log('⚠️ CookieHelper not available - using simple redirects only');
}

module.exports = router;
