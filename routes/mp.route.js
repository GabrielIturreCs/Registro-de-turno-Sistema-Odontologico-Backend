const express = require('express')
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js')


router.post('/payment', mpCtrl.getPaymentLink);


module.exports = router;