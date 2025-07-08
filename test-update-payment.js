// Test para verificar el endpoint de actualización de pago
const axios = require('axios');

async function testUpdatePayment() {
    try {
        console.log('🧪 Probando actualización de estado de pago...');
        
        // Primero obtener los turnos actuales
        const turnosResponse = await axios.get('http://localhost:3000/api/turno');
        const turnos = turnosResponse.data;
        
        console.log('📋 Turnos disponibles:', turnos.length);
        
        if (turnos.length > 0) {
            // Tomar el primer turno para probar
            const turno = turnos[0];
            console.log('🎯 Turno seleccionado:', {
                id: turno._id,
                nroTurno: turno.nroTurno,
                estadoActual: turno.estado,
                paymentStatusActual: turno.paymentStatus,
                metodoPagoActual: turno.metodoPago
            });
            
            // Probar actualización de pago
            const updateResponse = await axios.post('http://localhost:3000/api/payment-callback/update-payment-status', {
                turnoId: turno._id,
                paymentId: 'test-payment-' + Date.now(),
                paymentStatus: 'approved'
            });
            
            console.log('✅ Respuesta de actualización:', updateResponse.data);
            
            // Verificar que se actualizó
            const turnoActualizado = await axios.get(`http://localhost:3000/api/turno`);
            const turnoResult = turnoActualizado.data.find(t => t._id === turno._id);
            
            console.log('🔍 Turno después de actualización:', {
                id: turnoResult._id,
                nroTurno: turnoResult.nroTurno,
                estadoNuevo: turnoResult.estado,
                paymentStatusNuevo: turnoResult.paymentStatus,
                metodoPagoNuevo: turnoResult.metodoPago,
                paymentId: turnoResult.paymentId
            });
            
        } else {
            console.log('⚠️ No hay turnos para probar');
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

testUpdatePayment();
