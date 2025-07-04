const express = require('express')
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js')

// Definimos las rutas para la gestión de un pago único en mercado pago
router.post('/payment', mpCtrl.getPaymentLink);

// Definimos las rutas para la gestión de un pago por suscripción en mercado pago
// ej. pagar todos los meses $ 10.000
router.post('/subscription', mpCtrl.getSubscriptionLink);


module.exports = router;