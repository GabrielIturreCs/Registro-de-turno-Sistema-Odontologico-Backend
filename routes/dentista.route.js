const express = require('express');
const router = express.Router();
const DentistaCtrl = require('../controllers/dentista.controller.js');

router.put('/:id', DentistaCtrl.updateDentista);
router.get('/:id', DentistaCtrl.getDentistaById);
router.delete('/:id', DentistaCtrl.deleteDentista);
router.get('/', DentistaCtrl.getDentistas);
router.post('/', DentistaCtrl.createDentista);

module.exports = router;