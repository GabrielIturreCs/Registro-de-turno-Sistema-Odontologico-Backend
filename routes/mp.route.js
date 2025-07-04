const express = require('express');
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js');

console.log('mpCtrl:', mpCtrl); // Para ver qué funciones se están importando

// Validar que las funciones existan antes de asignarlas a las rutas
if (typeof mpCtrl.getPaymentLink !== 'function') {
  throw new Error('mpCtrl.getPaymentLink no es una función o no está definida');
}
if (typeof mpCtrl.getSubscriptionLink !== 'function') {
  throw new Error('mpCtrl.getSubscriptionLink no es una función o no está definida');
}

router.post('/payment', mpCtrl.getPaymentLink);
router.post('/subscription', mpCtrl.getSubscriptionLink);

module.exports = router;