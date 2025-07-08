const express = require('express');
const router = express.Router();

console.log('🎯 NEW Payment callback routes loading...');

// Ruta de prueba
router.get('/debug', (req, res) => {
    console.log('🔍 === DEBUG ROUTE ===');
    console.log('Environment variables:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('- Host:', req.get('host'));
    
    res.json({
        success: true,
        message: 'Debug route working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            FRONTEND_URL: process.env.FRONTEND_URL,
            host: req.get('host')
        }
    });
});

// Endpoint para SUCCESS con redirección correcta
router.get('/success', (req, res) => {
    console.log('🎉 === SUCCESS CALLBACK (PRODUCCIÓN) ===');
    console.log('Query params:', req.query);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Frontend URL config:', process.env.FRONTEND_URL);
    
    const {
        collection_id,
        collection_status,
        external_reference,
        payment_id
    } = req.query;
    
    // URL del frontend en producción
    const frontendUrl = process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com';
    
    // Construir parámetros
    const params = new URLSearchParams({
        collection_id: collection_id || '',
        collection_status: collection_status || 'approved',
        external_reference: external_reference || '',
        payment_id: payment_id || collection_id || '',
        return: 'vistaPaciente',
        userType: 'paciente'
    });
    
    const redirectUrl = `${frontendUrl}/payment/success?${params.toString()}`;
    
    console.log('🔄 PRODUCCIÓN - Redirigiendo a:', redirectUrl);
    return res.redirect(redirectUrl);
});

// Endpoint para PENDING
router.get('/pending', (req, res) => {
    console.log('⏳ === PENDING CALLBACK (PRODUCCIÓN) ===');
    
    const {
        collection_id,
        collection_status,
        external_reference,
        payment_id
    } = req.query;
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com';
    const params = new URLSearchParams({
        collection_id: collection_id || '',
        collection_status: collection_status || 'pending',
        external_reference: external_reference || '',
        payment_id: payment_id || collection_id || '',
        return: 'vistaPaciente',
        userType: 'paciente'
    });
    
    const redirectUrl = `${frontendUrl}/payment/pending?${params.toString()}`;
    
    console.log('🔄 PRODUCCIÓN - Redirigiendo a:', redirectUrl);
    return res.redirect(redirectUrl);
});

// Endpoint para FAILURE
router.get('/failure', (req, res) => {
    console.log('❌ === FAILURE CALLBACK (PRODUCCIÓN) ===');
    
    const {
        collection_id,
        collection_status,
        external_reference,
        payment_id
    } = req.query;
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com';
    const params = new URLSearchParams({
        collection_id: collection_id || '',
        collection_status: collection_status || 'failure',
        external_reference: external_reference || '',
        payment_id: payment_id || collection_id || '',
        return: 'vistaPaciente',
        userType: 'paciente'
    });
    
    const redirectUrl = `${frontendUrl}/payment/failure?${params.toString()}`;
    
    console.log('🔄 PRODUCCIÓN - Redirigiendo a:', redirectUrl);
    return res.redirect(redirectUrl);
});

// Endpoint para actualizar estado de pago (conservado del archivo original)
router.post('/update-payment-status', async (req, res) => {
    console.log('🔄 === ACTUALIZACIÓN DE PAGO (NEW) ===');
    
    try {
        const Turno = require('../models/turno');
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

console.log('✅ NEW Payment callback routes loaded');

module.exports = router;
