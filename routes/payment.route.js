const express = require('express');
const router = express.Router();

// Middleware para generar una clave secreta de pago
const generatePaymentSecret = () => {
    return 'payment_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// POST: Guardar información de pago en cookies seguras
router.post('/set-payment-data', (req, res) => {
    try {
        const { turnoInfo, userType, paymentReference } = req.body;
        
        // Generar un token único para esta sesión de pago
        const paymentToken = generatePaymentSecret();
        
        // Configurar cookies seguras (30 minutos de expiración)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000 // 30 minutos
        };
        
        // Guardar información del turno
        res.cookie('turno_payment_info', JSON.stringify(turnoInfo), cookieOptions);
        res.cookie('user_type_payment', userType, cookieOptions);
        res.cookie('payment_reference', paymentReference, cookieOptions);
        res.cookie('payment_token', paymentToken, cookieOptions);
        res.cookie('payment_in_progress', 'true', cookieOptions);
        
        console.log('✅ Información de pago guardada en cookies seguras');
        
        res.status(200).json({
            success: true,
            message: 'Información de pago guardada exitosamente',
            paymentToken: paymentToken
        });
        
    } catch (error) {
        console.error('❌ Error al guardar información de pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar información de pago'
        });
    }
});

// GET: Recuperar información de pago desde cookies
router.get('/get-payment-data', (req, res) => {
    try {
        const turnoInfo = req.cookies.turno_payment_info ? JSON.parse(req.cookies.turno_payment_info) : null;
        const userType = req.cookies.user_type_payment;
        const paymentReference = req.cookies.payment_reference;
        const paymentToken = req.cookies.payment_token;
        const paymentInProgress = req.cookies.payment_in_progress;
        
        if (!turnoInfo || !paymentToken) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información de pago válida'
            });
        }
        
        console.log('✅ Información de pago recuperada desde cookies');
        
        res.status(200).json({
            success: true,
            data: {
                turnoInfo,
                userType,
                paymentReference,
                paymentToken,
                paymentInProgress: paymentInProgress === 'true'
            }
        });
        
    } catch (error) {
        console.error('❌ Error al recuperar información de pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error al recuperar información de pago'
        });
    }
});

// POST: Limpiar cookies de pago (después de completar o cancelar)
router.post('/clear-payment-data', (req, res) => {
    try {
        // Limpiar todas las cookies relacionadas con el pago
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        
        res.clearCookie('turno_payment_info', cookieOptions);
        res.clearCookie('user_type_payment', cookieOptions);
        res.clearCookie('payment_reference', cookieOptions);
        res.clearCookie('payment_token', cookieOptions);
        res.clearCookie('payment_in_progress', cookieOptions);
        
        console.log('✅ Cookies de pago limpiadas exitosamente');
        
        res.status(200).json({
            success: true,
            message: 'Información de pago limpiada exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error al limpiar información de pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error al limpiar información de pago'
        });
    }
});

// POST: Marcar pago como exitoso
router.post('/mark-payment-success', (req, res) => {
    try {
        const { paymentId, status } = req.body;
        
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutos
        };
        
        res.cookie('payment_success', 'true', cookieOptions);
        res.cookie('payment_id', paymentId, cookieOptions);
        res.cookie('payment_status', status, cookieOptions);
        
        console.log('✅ Pago marcado como exitoso en cookies');
        
        res.status(200).json({
            success: true,
            message: 'Pago marcado como exitoso'
        });
        
    } catch (error) {
        console.error('❌ Error al marcar pago como exitoso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar pago como exitoso'
        });
    }
});

module.exports = router;
