const express = require('express');
const router = express.Router();
const cookieHelper = require('../helpers/cookieHelper');

// Endpoint para manejar el retorno exitoso de MercadoPago
router.get('/success', (req, res) => {
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

module.exports = router;
