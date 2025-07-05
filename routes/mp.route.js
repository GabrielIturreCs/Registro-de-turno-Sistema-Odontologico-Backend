const express = require('express')
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js')


router.post('/payment', mpCtrl.getPaymentLink);
router.post('/subscription', mpCtrl.getSubscriptionLink);


module.exports = router;