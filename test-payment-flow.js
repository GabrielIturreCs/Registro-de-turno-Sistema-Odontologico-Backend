const axios = require('axios');

async function testCompletePaymentFlow() {
  console.log('🧪 === PRUEBA COMPLETA DEL FLUJO DE PAGO ===\n');
  
  try {
    // 1. Obtener un turno de ejemplo
    console.log('📋 1. Obteniendo turnos disponibles...');
    const turnosResponse = await axios.get('http://localhost:3000/api/turno');
    const turnos = turnosResponse.data;
    
    // Buscar un turno que no esté pagado
    const turnoParaPagar = turnos.find(t => 
      t.estado !== 'pagado' && 
      t.estado !== 'cancelado' && 
      t.paymentStatus !== 'approved'
    );
    
    if (!turnoParaPagar) {
      console.log('⚠️ No se encontraron turnos disponibles para simular pago');
      return;
    }
    
    console.log(`✅ Turno seleccionado: ${turnoParaPagar.nroTurno} - Estado: ${turnoParaPagar.estado}`);
    console.log(`   Paciente: ${turnoParaPagar.nombre} ${turnoParaPagar.apellido}`);
    console.log(`   Precio: $${turnoParaPagar.precioFinal}\n`);
    
    // 2. Simular pago exitoso
    console.log('💳 2. Simulando pago exitoso en MercadoPago...');
    const paymentId = `mp_payment_${Date.now()}`;
    const paymentStatus = 'approved';
    
    const updateResponse = await axios.post('http://localhost:3000/api/payment-callback/update-payment-status', {
      turnoId: turnoParaPagar._id,
      paymentId: paymentId,
      paymentStatus: paymentStatus
    });
    
    console.log('✅ Respuesta de actualización:', updateResponse.data.success ? 'ÉXITO' : 'ERROR');
    console.log(`   Nuevo estado del turno: ${updateResponse.data.turno.estado}`);
    console.log(`   Payment Status: ${updateResponse.data.turno.paymentStatus}`);
    console.log(`   Payment ID: ${updateResponse.data.turno.paymentId}\n`);
    
    // 3. Simular redirección con parámetros de MercadoPago
    console.log('🔄 3. Simulando redirección desde MercadoPago...');
    const redirectUrl = `http://localhost:4201/payment/success`;
    const queryParams = new URLSearchParams({
      collection_id: paymentId,
      collection_status: paymentStatus,
      external_reference: turnoParaPagar._id,
      payment_type: 'credit_card',
      preference_id: `pref_${Date.now()}`,
      site_id: 'MLA'
    });
    
    const fullRedirectUrl = `${redirectUrl}?${queryParams.toString()}`;
    
    console.log('🌐 URL de redirección simulada:');
    console.log(fullRedirectUrl);
    console.log('\n📝 Parámetros de MercadoPago simulados:');
    console.log(`   collection_id: ${paymentId}`);
    console.log(`   collection_status: ${paymentStatus}`);
    console.log(`   external_reference: ${turnoParaPagar._id}`);
    
    console.log('\n🎉 === FLUJO DE PAGO SIMULADO EXITOSAMENTE ===');
    console.log('📌 Pasos a seguir para probar manualmente:');
    console.log('1. Abrir http://localhost:4201 en el navegador');
    console.log('2. Iniciar sesión como paciente');
    console.log('3. Navegar a la URL de redirección generada arriba');
    console.log('4. Verificar que:');
    console.log('   - Se muestre la cuenta regresiva de 3 segundos');
    console.log('   - Redirija a /vistaPaciente');
    console.log('   - Se mantenga la sesión del usuario');
    console.log('   - El turno aparezca en "Turnos Recientes" y "Mis Turnos"');
    console.log('   - El estado del turno sea "Pagado"');
    
  } catch (error) {
    console.error('❌ Error en la simulación:', error.message);
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response.status, error.response.data);
    }
  }
}

// Función para simular diferentes estados de pago
async function testPaymentStates() {
  console.log('\n🧪 === PRUEBAS DE DIFERENTES ESTADOS DE PAGO ===\n');
  
  const states = [
    { status: 'approved', description: 'Pago Aprobado' },
    { status: 'pending', description: 'Pago Pendiente' },
    { status: 'rejected', description: 'Pago Rechazado' }
  ];
  
  for (const state of states) {
    console.log(`🔄 Probando: ${state.description} (${state.status})`);
    
    const redirectUrl = `http://localhost:4201/payment/${state.status === 'approved' ? 'success' : state.status === 'pending' ? 'pending' : 'failure'}`;
    const queryParams = new URLSearchParams({
      collection_id: `test_payment_${Date.now()}`,
      collection_status: state.status,
      external_reference: '6869b84a6c28292804ba7738', // Usar un ID de turno existente
      payment_type: 'credit_card'
    });
    
    console.log(`   URL: ${redirectUrl}?${queryParams.toString()}`);
  }
}

// Ejecutar pruebas
testCompletePaymentFlow().then(() => {
  testPaymentStates();
});
