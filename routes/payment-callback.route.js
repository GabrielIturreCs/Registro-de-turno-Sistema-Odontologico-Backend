const express = require('express');
const router = express.Router();
const Turno = require('../models/turno');
const axios = require('axios');

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
        
        try {
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
        } catch (error) {
            console.error('❌ Error en success-full:', error);
            // Fallback: redirigir al dashboard
            const redirectUrl = `${process.env.FRONTEND_URL}/dashboard`;
            return res.redirect(redirectUrl);
        }
    });

    // Endpoint para manejar pagos pendientes
    router.get('/pending-full', (req, res) => {
        console.log('⏳ === PAGO PENDIENTE ===');
        
        try {
            const turnoInfo = cookieHelper.getTurnoCookie(req);
            
            if (turnoInfo) {
                cookieHelper.setPaymentStatusCookie(res, 'pending', turnoInfo.userType);
                cookieHelper.clearTurnoCookie(res);
                
                const userRole = turnoInfo.userType === 'paciente' ? 'vistaPaciente' : 'dashboard';
                const redirectUrl = `${process.env.FRONTEND_URL}/payment/pending?return=${userRole}&userType=${turnoInfo.userType}`;
                
                return res.redirect(redirectUrl);
            }
            
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (error) {
            console.error('❌ Error en pending-full:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }
    });

    // Endpoint para manejar fallos de pago
    router.get('/failure-full', (req, res) => {
        console.log('❌ === PAGO FALLIDO ===');
        
        try {
            const turnoInfo = cookieHelper.getTurnoCookie(req);
            
            if (turnoInfo) {
                cookieHelper.setPaymentStatusCookie(res, 'failure', turnoInfo.userType);
                cookieHelper.clearTurnoCookie(res);
                
                const userRole = turnoInfo.userType === 'paciente' ? 'vistaPaciente' : 'dashboard';
                const redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?return=${userRole}&userType=${turnoInfo.userType}`;
                
                return res.redirect(redirectUrl);
            }
            
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (error) {
            console.error('❌ Error en failure-full:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }
    });

    // Endpoint para verificar el estado del pago desde el frontend
    router.get('/status', (req, res) => {
        try {
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
        } catch (error) {
            console.error('❌ Error en status endpoint:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing payment status'
            });
        }
    });

    // Webhook de MercadoPago para notificaciones de pago
    router.post('/webhook', async (req, res) => {
        console.log('🔔 === WEBHOOK DE MERCADOPAGO ===');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        
        try {
            const { type, data } = req.body;
            
            if (type === 'payment') {
                const paymentId = data.id;
                console.log('💳 Procesando notificación de pago:', paymentId);
                
                // Obtener información del pago desde MercadoPago
                const paymentInfo = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
                    }
                });
                
                const payment = paymentInfo.data;
                console.log('📊 Estado del pago:', payment.status);
                console.log('📋 Referencia externa:', payment.external_reference);
                
                // Buscar el turno por external_reference (debería ser el ID del turno)
                if (payment.external_reference) {
                    const turno = await Turno.findById(payment.external_reference);
                    
                    if (turno) {
                        console.log('✅ Turno encontrado:', turno.nroTurno);
                              // Actualizar el turno con la información del pago
                    turno.paymentId = paymentId;
                    turno.paymentStatus = payment.status;
                    turno.paymentNotificationDate = new Date();
                    turno.montoRecibido = payment.transaction_amount;
                    turno.paymentDetails = {
                        payment_method_id: payment.payment_method_id,
                        payment_type_id: payment.payment_type_id,
                        issuer_id: payment.issuer_id,
                        installments: payment.installments,
                        date_approved: payment.date_approved,
                        date_created: payment.date_created
                    };
                    
                    // Actualizar el estado del turno según el estado del pago
                    if (payment.status === 'approved') {
                        turno.estado = 'pagado';
                        turno.fechaPago = new Date(payment.date_approved || payment.date_created);
                    } else if (payment.status === 'pending') {
                        turno.estado = 'pendiente_pago_online';
                    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                        turno.estado = 'pendiente'; // Volver a estado anterior
                    }
                        
                        await turno.save();
                        console.log('💾 Turno actualizado exitosamente');
                    } else {
                        console.log('⚠️ No se encontró turno con ID:', payment.external_reference);
                    }
                } else {
                    console.log('⚠️ No se encontró external_reference en el pago');
                }
            }
            
            // Responder a MercadoPago
            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
            res.status(500).json({ error: 'Error processing webhook' });
        }
    });

    // Endpoint para actualizar manualmente el estado de un pago
    router.post('/update-payment-status', async (req, res) => {
        console.log('🔄 === ACTUALIZACIÓN MANUAL DE PAGO ===');
        
        try {
            const { turnoId, paymentId, paymentStatus } = req.body;
            
            if (!turnoId) {
                return res.status(400).json({ error: 'turnoId es requerido' });
            }
            
            const turno = await Turno.findById(turnoId);
            if (!turno) {
                return res.status(404).json({ error: 'Turno no encontrado' });
            }
            
            // Actualizar información del pago
            if (paymentId) turno.paymentId = paymentId;
            if (paymentStatus) turno.paymentStatus = paymentStatus;
            
            // Actualizar estado del turno según el estado del pago
            if (paymentStatus === 'approved') {
                turno.estado = 'pagado';
            } else if (paymentStatus === 'pending') {
                turno.estado = 'pendiente_pago_online';
            } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
                turno.estado = 'pendiente';
            }
            
            await turno.save();
            
            console.log('✅ Estado de pago actualizado:', {
                turnoId,
                paymentId,
                paymentStatus,
                newEstado: turno.estado
            });
            
            res.json({
                success: true,
                turno: turno,
                message: 'Estado de pago actualizado correctamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando estado de pago:', error);
            res.status(500).json({ error: 'Error actualizando estado de pago' });
        }
    });

} else {
    console.log('⚠️ CookieHelper not available - using simple redirects only');
}

module.exports = router;
