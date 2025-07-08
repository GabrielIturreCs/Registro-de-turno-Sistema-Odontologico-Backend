// Script de prueba para el endpoint de payment callback
const axios = require('axios');

async function testPaymentCallback() {
    try {
        console.log('🧪 Testing payment callback endpoint...');
        
        // Test 1: Verificar que el endpoint esté disponible
        const testResponse = await axios.get('http://localhost:3000/api/payment-callback/test');
        console.log('✅ Test endpoint response:', testResponse.data);
        
        // Test 2: Probar update-payment-status
        const updateResponse = await axios.post('http://localhost:3000/api/payment-callback/update-payment-status', {
            turnoId: '507f1f77bcf86cd799439011', // ID de prueba
            paymentId: 'test-payment-123',
            paymentStatus: 'approved'
        });
        console.log('✅ Update payment status response:', updateResponse.data);
        
    } catch (error) {
        console.error('❌ Error testing payment callback:', error.response?.data || error.message);
    }
}

testPaymentCallback();
