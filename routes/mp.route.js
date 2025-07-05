const express = require('express');
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js');

console.log('mpCtrl:', mpCtrl);
console.log('mpCtrl keys:', Object.keys(mpCtrl));

// Rutas básicas sin validación estricta
router.post('/payment', (req, res) => {
    if (mpCtrl.getPaymentLink) {
        return mpCtrl.getPaymentLink(req, res);
    } else {
        return res.status(500).json({ error: 'getPaymentLink not available' });
    }
});

router.post('/subscription', (req, res) => {
    if (mpCtrl.getSubscriptionLink) {
        return mpCtrl.getSubscriptionLink(req, res);
    } else {
        return res.status(500).json({ error: 'getSubscriptionLink not available' });
    }
});

module.exports = router;